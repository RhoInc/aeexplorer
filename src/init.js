/*------------------------------------------------------------------------------------------------\
  Initialize adverse event explorer.
\------------------------------------------------------------------------------------------------*/

export function init(canvas, data, settings, onDataError) {
  //Render single column if no group variable is specified.
    if (!(settings.variables.group) || ['', ' '].indexOf(settings.variables.group) > -1) {
        settings.variables.group = 'data_all';
        settings.defaults.totalCol = '';
        settings.groups = [{'key':'All'}];
    }

  //Convert the canvas argument to a d3 selection.
    canvas = d3.select(canvas);

    function errorNote(msg) {
        canvas.append('div').attr('class', 'alert alert-error alert-danger').text(msg);
    };

  //Check that variables specified in settings exist in data.
    for (var x in settings.variables) {
        var varList = d3.keys(data[0]).concat('data_all');

        if (varList.indexOf(settings.variables[x]) === -1) {
            if (settings.variables[x] instanceof Array) {
                settings.variables[x].forEach(function(e) {
                    if (d3.keys(data[0]).indexOf(e) === -1) {
                        errorNote('Error in variables object.');
                        throw new Error(x + ' variable ' + '(\'' + e + '\') not found in dataset.');
                    }
                });
            } else {
                errorNote('Error in variables object.');
                throw new Error(x + ' variable ' + '(\'' + settings.variables[x] + '\') not found in dataset.');
            }
        }
    }

  //Check that group values defined in settings are actually present in dataset.
    if (!(settings.groups) || settings.groups.length === 0) {
        var groups = [];
        data.forEach(function(d) {
            if (groups.indexOf(d[settings.variables.group]) === -1)
                groups.push(d[settings.variables.group]);
        });
        var groupsObject = groups.map(function(d) { return {'key': d}; });
        settings.groups = groupsObject;
    }

    settings.groups.forEach(function(e) {
        var varList = d3.set(
            data.map(function(d) {
                return d[settings.variables.group];
            })).values().concat('All');

        if (varList.indexOf(e.key) === -1) {
            errorNote('Error in settings object.');
            throw new Error('\'' + e.key + '\' in the Groups setting is not found in the dataset.');
        }
    });

  //Set the domain for the color scale based on groups.
    settings.groups.sort();
    this.colorScale.domain(
        settings.groups.map(function(e) {
            return e.key;
        }));

  //Set 'Total' column color to #777.
    if (settings.defaults.totalCol === 'Show')
        this.colorScale.range()[settings.groups.length] = '#777';

  //Initialize adverse event eplorer.
    this.layout(canvas);
    this.controls.init(this, canvas, data, settings.variables, settings);
    this.eventListeners.rateFilter(this, canvas);
    this.eventListeners.search(this, canvas, data, settings.variables, settings);
    this.eventListeners.customFilters(this, canvas, data, settings.variables, settings);
    this.AETable.redraw(this, canvas, data, settings.variables, settings)
}
