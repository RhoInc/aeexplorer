/*------------------------------------------------------------------------------------------------\
  Initialize custom controls.
\------------------------------------------------------------------------------------------------*/

//export function init(selector, data, vars, settings) {
export function init(chart) {
  //initialize the wrapper
    var selector = chart.controls.wrap
        .append('div')
        .attr('class', 'custom-filters');

  //Create list of filter variables.
    var filterVars = chart.config.filters
        .map(function(e) {
            return {
                value_col: e.value_col,
                values: []}; });

  //Create list for each filter variable of its distinct values.
    filterVars.forEach(function(e) {
        var varLevels = d3.nest()
            .key(function(d) { return d[e.value_col]; })
            .entries(chart.raw_data);
        e.values = varLevels
            .map(function(d) {
                return d.key; });
    });

  //Clear custom controls.
    selector.selectAll('ul.nav')
        .remove();

  //Add filter controls.
    var filterList = selector
        .append('ul')
        .attr('class', 'nav');
    var filterItem = filterList.selectAll('li')
        .data(filterVars).enter()
        .append('li')
        .attr('class', function(d) {
            return 'custom-' + d.key + ' filterCustom'; });
    var filterLabel = filterItem
        .append('span')
        .attr('class', 'filterLabel')
        .text(function(d) {
            if (chart.config.filters) {
                var filterLabel = chart.config.filters.filter(function(d1) {
                    return d1.value_col === d.value_col;
                })[0].label;

                return filterLabel ? filterLabel : d.key;
            } else return d.key; });
    var filterCustom = filterItem
        .append('select')
        .attr('multiple', true);

  //Add data-driven filter options.
    var filterItems = filterCustom.selectAll('option')
        .data(function(d) {
            return d.values
                .filter(function(di) {
                    return ['NA', '', ' '].indexOf(di) === -1; }); })
        .enter()
        .append('option')
        .html(function(d) {
                return  '<span><i class = "icon-remove icon-white fa fa-times"></i></span>'
                    +   (['NA', '', ' '].indexOf(d) > -1 ? '[None]' : d); })
        .attr('value', function(d) {
            return d; })
        .attr('selected', 'selected');

  //Initialize event listeners
    filterCustom.on('change', function() {
        chart.AETable.redraw(chart);
    });
}
