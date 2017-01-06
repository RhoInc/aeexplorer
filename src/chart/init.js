/*------------------------------------------------------------------------------------------------\
  Initialize adverse event explorer.
\------------------------------------------------------------------------------------------------*/

export function init(data) {
    var settings = this.config;

    //create chart wrapper in specified div
    this.wrap = d3.select(this.element).append('div');
    this.wrap.attr("class","aeExplorer")

    this.raw_data = data; 

  //Render single column if no group variable is specified.
    if (!(settings.variables.group) || ['', ' '].indexOf(settings.variables.group) > -1) {
        settings.variables.group = 'data_all';
        settings.defaults.totalCol = '';
        settings.groups = [{'key':'All'}];
    }

    function errorNote(msg) {
        element.append('div').attr('class', 'alert alert-error alert-danger').text(msg);
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
    var groups = d3.set(data.map(d => d[settings.variables.group]))
        .values();
    var groupsObject = groups
        .map(d => {return {'key': d}; });

    if (!settings.groups || settings.groups.length === 0)
        settings.groups = groupsObject
            .sort((a,b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0);

    settings.groups
        .forEach(d => {
            if (groups.indexOf(d.key) === -1) {
                errorNote('Error in settings object.');
                throw new Error('\'' + e.key + '\' in the Groups setting is not found in the dataset.');
            }
        });

  //Set the domain for the color scale based on groups.
    this.colorScale.domain(
        settings.groups.map(function(e) {
            return e.key;
        }));

  //Set 'Total' column color to #777.
    if (settings.defaults.totalCol === 'Show')
        this.colorScale.range()[settings.groups.length] = '#777';

  //Initialize adverse event eplorer.
    this.layout();
    this.controls.init(this);
    this.AETable.redraw(this, this.wrap, data, settings.variables, settings)
}
