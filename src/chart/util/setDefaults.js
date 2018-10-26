import defaultSettings from '../defaultSettings';

/*------------------------------------------------------------------------------------------------\
  Filter the raw data per the current filter and group selections.
\------------------------------------------------------------------------------------------------*/
export function setDefaults(chart) {
    function errorNote(msg) {
        chart.wrap.append('div').attr('class', 'wc-alert').text('Fatal Error: ' + msg);
    }

    /////////////////////////////
    // Fill defaults as needed //
    /////////////////////////////
    //variables
    chart.config.variables = chart.config.variables || {};

    const variables = ['id', 'major', 'minor', 'group'];
    variables.forEach(function(varName) {
        chart.config.variables[varName] =
            chart.config.variables[varName] || defaultSettings.variables[varName];
    });

    //details, filters and groups
    chart.config.variables.details =
        chart.config.variables.details || defaultSettings.variables.details || [];

    chart.config.variables.filters =
        chart.config.variables.filters || defaultSettings.variables.filters || [];

    chart.config.groups = chart.config.groups || defaultSettings.groups || [];

    //variableOptions
    chart.config.variableOptions =
        chart.config.variableOptions || defaultSettings.variableOptions || {};

    variables.forEach(function(varName) {
        //initialize options for each mapping variable
        chart.config.variableOptions[varName] = chart.config.variableOptions[varName]
            ? chart.config.variableOptions[varName]
            : [];

        //confirm that specified variables are included as options
        var options = chart.config.variableOptions[varName];
        if (options.indexOf(chart.config.variables[varName]) == -1) {
            options.push(chart.config.variables[varName]);
        }

        //add "None" option for group dropdown

        if ((varName == 'group') & (options.indexOf('None') == -1)) {
            options.push('None');
        }
    });

    //defaults
    chart.config.defaults = chart.config.defaults || {};
    var defaults = Object.keys(defaultSettings.defaults);
    defaults.forEach(dflt => {
        if (
            dflt !== 'placeholderFlag' // handle primitive types such as maxPrevalence
        )
            chart.config.defaults[dflt] = chart.config.defaults[dflt] !== undefined
                ? chart.config.defaults[dflt]
                : defaultSettings.defaults[dflt];
        else {
            // handle objects such as placeholderFlag
            const object = {};
            for (const prop in defaultSettings.defaults[dflt]) {
                object[prop] = chart.config.defaults[dflt] !== undefined
                    ? chart.config.defaults[dflt][prop] !== undefined
                      ? chart.config.defaults[dflt][prop]
                      : defaultSettings.defaults[dflt][prop]
                    : defaultSettings.defaults[dflt][prop];
            }
            chart.config.defaults[dflt] = object;
        }
    });

    //plot settings
    chart.config.plotSettings = chart.config.plotSettings || {};
    var plotSettings = ['h', 'w', 'r', 'margin', 'diffMargin'];
    plotSettings.forEach(function(varName) {
        chart.config.plotSettings[varName] =
            chart.config.plotSettings[varName] || defaultSettings.plotSettings[varName];
    });

    ////////////////////////////////////////////////////////////
    // Convert group levels from string to objects (if needed)//
    ////////////////////////////////////////////////////////////
    var allGroups = d3.set(chart.raw_data.map(d => d[chart.config.variables.group])).values();
    chart.config.groups = chart.config.groups
        .map(function(d) {
            return typeof d == 'string' ? { key: d } : d;
        })
        .filter(function(d) {
            if (allGroups.indexOf(d.key) === -1)
                console.log(
                    'Warning: You specified a group level ("' +
                        d.key +
                        '") that was not found in the data. It is being ignored.'
                );
            return allGroups.indexOf(d.key) > -1;
        });

    ////////////////////////////////////////////////////
    // Include all group levels if none are specified //
    ////////////////////////////////////////////////////

    var groupsObject = allGroups.map(d => {
        return { key: d };
    });

    if (!chart.config.groups || chart.config.groups.length === 0)
        chart.config.groups = groupsObject.sort(
            (a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0)
        );

    //////////////////////////////////////////////////////////////
    //Check that variables specified in settings exist in data. //
    //////////////////////////////////////////////////////////////
    for (var x in chart.config.variables) {
        var varList = d3.keys(chart.raw_data[0]).concat('data_all');

        if (varList.indexOf(chart.config.variables[x]) === -1) {
            if (chart.config.variables[x] instanceof Array) {
                chart.config.variables[x].forEach(function(e) {
                    var value_col = e instanceof Object ? e.value_col : e;
                    if (varList.indexOf(value_col) === -1) {
                        errorNote('Error in variables object.');
                        throw new Error(x + ' variable ' + "('" + e + "') not found in dataset.");
                    }
                });
            } else {
                errorNote('Error in variables object.');
                throw new Error(
                    x + ' variable ' + "('" + chart.config.variables[x] + "') not found in dataset."
                );
            }
        }
    }

    /////////////////////////////////////////////////////////////////////////////////
    //Checks on group columns (if they're being renderered)                        //
    /////////////////////////////////////////////////////////////////////////////////
    if (chart.config.defaults.groupCols) {
        //Check that group values defined in settings are actually present in dataset. //
        if (
            chart.config.defaults.groupCols &
            (chart.config.groups.length > chart.config.defaults.maxGroups)
        ) {
            var errorText =
                'Too Many Group Variables specified. You specified ' +
                chart.config.groups.length +
                ', but the maximum supported is ' +
                chart.config.defaults.maxGroups +
                '.';
            errorNote(errorText);
            throw new Error(errorText);
        }

        //Set the domain for the color scale based on groups. //
        chart.colorScale.domain(chart.config.groups.map(e => e.key));
    }

    //make sure either group or total columns are being renderered
    if (!chart.config.defaults.groupCols & !chart.config.defaults.totalCol) {
        var errorText =
            'No data to render. Make sure at least one of chart.config.defaults.groupCols or chart.config.defaults.totalCol is set to true.';
        errorNote(errorText);
        throw new Error(errorText);
    }

    //don't render differences if you're not renderering group columns
    if (!chart.config.defaults.groupCols) {
        chart.config.defaults.diffCol = false;
    }

    //hide the total column if only one group is selected
    if (chart.config.groups.length == 1) {
        chart.config.defaults.totalCol = false;
    }

    //set color for total column
    if (chart.config.defaults.totalCol)
        //Set 'Total' column color to #777.
        chart.colorScale.range()[chart.config.groups.length] = '#777';
}
