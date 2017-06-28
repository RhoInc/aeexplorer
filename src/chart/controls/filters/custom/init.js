/*------------------------------------------------------------------------------------------------\
  Initialize custom controls.
\------------------------------------------------------------------------------------------------*/

//export function init(selector, data, vars, settings) {
export function init(chart) {
    //initialize the wrapper
    var selector = chart.controls.wrap.append('div').attr('class', 'custom-filters');

    //add a list of values to each filter object
    chart.config.variables.filters.forEach(function(e) {
        var currentData = e.type == 'Participant' ? chart.raw_data : chart.raw_event_data;
        e.values = d3
            .nest()
            .key(function(d) {
                return d[e.value_col];
            })
            .entries(currentData)
            .map(d => d.key);
    });

    //drop filters with 0 or 1 levels and throw a warning
    chart.config.variables.filters = chart.config.variables.filters.filter(function(d) {
        if (d.values.length <= 1) {
            console.warn(
                d.value_col + ' filter not shown since the variable has less than 2 levels'
            );
        }
        return d.values.length > 1;
    });

    //Clear custom controls.
    selector.selectAll('ul.nav').remove();

    //Add filter controls.
    var filterList = selector.append('ul').attr('class', 'nav');
    var filterItem = filterList
        .selectAll('li')
        .data(chart.config.variables.filters)
        .enter()
        .append('li')
        .attr('class', function(d) {
            return 'custom-' + d.key + ' filterCustom';
        });
    var filterLabel = filterItem.append('span').attr('class', 'filterLabel');

    filterLabel.append('span').html(d => d.label || d.value_col);

    filterLabel
        .append('sup')
        .attr('class', 'filterType')
        .text(function(d) {
            return d.type == 'event' ? 'E' : 'P';
        })
        .property('title', function(d) {
            return d.type == 'event'
                ? 'Event filter: Changes rate counts only. Does not change population.'
                : 'Participant filter: Changes rate counts and populations.';
        });

    var filterCustom = filterItem.append('select').attr('multiple', true);

    //Add data-driven filter options.
    var filterItems = filterCustom
        .selectAll('option')
        .data(function(d) {
            return d.values;
        })
        .enter()
        .append('option')
        .html(function(d) {
            return d;
        })
        .attr('value', function(d) {
            return d;
        })
        .attr('selected', 'selected');

    //Initialize event listeners
    filterCustom.on('change', function() {
        chart.AETable.redraw(chart);
    });
}
