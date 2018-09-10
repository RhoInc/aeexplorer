export function makeDetailData(chart, detailTableSettings) {
    //convenience mappings
    var major = detailTableSettings.major;
    var minor = detailTableSettings.minor;
    var vars = chart.config.variables;

    //Filter the raw data given the select major and/or minor category.
    var details = chart.population_event_data.filter(d => {
        var majorMatch = major === 'All' ? true : major === d[vars['major']];
        var minorMatch = minor === 'All' ? true : minor === d[vars['minor']];
        return majorMatch && minorMatch;
    });

    if (vars.details.length === 0)
        vars.details = Object.keys(chart.population_data[0]).filter(
            d => ['data_all', 'placeholderFlag'].indexOf(d) === -1
        );

    //Keep only those columns specified in settings.variables.details append
    //If provided with a details object use that to determine chosen
    //variables and headers
    var detailVars = vars.details;
    var details = details.map(d => {
        var current = {};
        detailVars.forEach(currentVar => {
            if (currentVar.value_col) {
                // only true if a details object is provided
                currentVar.label // if label is provided, write over column name with label
                    ? (current[currentVar.label] = d[currentVar.value_col])
                    : (current[currentVar.value_col] = d[currentVar.value_col]);
            } else {
                current[currentVar] = d[currentVar];
            }
        });
        return current;
    });

    return details;
}
