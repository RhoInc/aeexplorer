import defaultSettings from '../defaultSettings';

/*------------------------------------------------------------------------------------------------\
  Filter the raw data per the current filter and group selections.
\------------------------------------------------------------------------------------------------*/
export function setDefaults(chart) {
    
    function errorNote(msg) {
        element.append('div').attr('class', 'alert alert-error alert-danger').text(msg);
    };

    /////////////////////////////
    // Fill defaults as needed //
    /////////////////////////////
    //variables
    chart.config.variables = chart.config.variables || {}    
    var variables = ["id","major","minor","group","details"]
    variables.forEach(function(varName){
        chart.config.variables[varName] = chart.config.variables[varName] || defaultSettings.variables[varName]
    })
    //variables.details
//    chart.config.variables.details = chart.config.variables.length ? chart.config.variables || []

    //filters
    chart.config.filters = chart.config.filters || defaultSettings.filters

    //groups
    chart.config.groups = chart.config.groups || defaultSettings.groups
  
    //defaults  
    chart.config.defaults = chart.config.defaults || {}
    var defaults = ["maxPrevalence","totalCol","diffCol","prefTerms"]
    defaults.forEach(function(varName){
        chart.config.defaults[varName] = chart.config.defaults[varName] || defaultSettings.defaults[varName]
    })

    //plot settings
    chart.config.plotSettings = chart.config.plotSettings || {}
    var plotSettings = ["h","w","r", "margin","diffMargin"]
    plotSettings.forEach(function(varName){
        chart.config.plotSettings[varName] = chart.config.plotSettings[varName] || defaultSettings.plotSettings[varName]
    })

    //plotSettings.margin & .diffMargin

    ////////////////////////////////////////////////////////////
    //Render single column if no group variable is specified. //
    ////////////////////////////////////////////////////////////
    if (!(chart.config.variables.group) || ['', ' '].indexOf(chart.config.variables.group) > -1) {
        chart.config.variables.group = 'data_all';
        chart.config.defaults.totalCol = '';
        chart.config.groups = [{'key':'All'}];
    }

    ////////////////////////////////////////////////////
    // Include all group levels if none are specified //
    ////////////////////////////////////////////////////
    var groups = d3.set(chart.raw_data.map(d => d[chart.config.variables.group])).values();
    var groupsObject = groups.map(d => {return {'key': d}; });

    if (!chart.config.groups || chart.config.groups.length === 0)
        chart.config.groups = groupsObject
            .sort((a,b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0);

    //////////////////////////////////////////////////////////////
    //Check that variables specified in settings exist in data. //
    //////////////////////////////////////////////////////////////
    for (var x in chart.config.variables) {
        var varList = d3.keys(chart.raw_data[0]).concat('data_all');

        if (varList.indexOf(chart.config.variables[x]) === -1) {
            if (chart.config.variables[x] instanceof Array) {
                chart.config.variables[x].forEach(function(e) {
                    if (d3.keys(chart.raw_data[0]).indexOf(e) === -1) {
                        errorNote('Error in variables object.');
                        throw new Error(x + ' variable ' + '(\'' + e + '\') not found in dataset.');
                    }
                });
            } else {
                errorNote('Error in variables object.');
                throw new Error(x + ' variable ' + '(\'' + chart.config.variables[x] + '\') not found in dataset.');
            }
        }
    }
    /////////////////////////////////////////////////////////////////////////////////
    //Check that group values defined in settings are actually present in dataset. //
    /////////////////////////////////////////////////////////////////////////////////
    chart.config.groups
        .forEach(d => {
            if (groups.indexOf(d.key) === -1) {
                errorNote('Error in settings object.');
                throw new Error('\'' + e.key + '\' in the Groups setting is not found in the dataset.');
            }
        });


    ////////////////////////////////////////////////////////
    //Set the domain for the color scale based on groups. //
    ////////////////////////////////////////////////////////
    chart.colorScale.domain(chart.config.groups.map(e => e.key));
    //Set 'Total' column color to #777.
    if (chart.config.defaults.totalCol === 'Show')
        chart.colorScale.range()[chart.config.groups.length] = '#777'; 
    


}