/*------------------------------------------------------------------------------------------------\
  Initialize controls.
\------------------------------------------------------------------------------------------------*/

export function init(chart) {
    chart.controls.wrap = chart.wrap.select('div.controls');
    chart.controls.wrap.attr('onsubmit', 'return false;');
    chart.controls.wrap.selectAll('*').remove();  //Clear controls.

  //Generate HTML containers.
    var rateFilter = chart.controls.wrap
        .append('div')
        .attr('class', 'rate-filter');
    var summaryControl = chart.controls.wrap
        .append('div')
        .attr('class', 'summary-control');
    var searchBox = chart.controls.wrap
        .append('form')
        .attr('class', 'searchForm navbar-search pull-right')
        .attr('onsubmit', 'return false;');
    var customFilters = chart.controls.wrap
        .append('div')
        .attr('class', 'custom-filters');

  //Draw UI component.
    chart.controls.filters.rate.init(rateFilter);
    chart.controls.summaryControl.init(summaryControl);
    chart.controls.filters.custom.init(customFilters, chart.raw_data, chart.config.variables, chart.config);
    chart.controls.search.init(searchBox);

  //Initialize the filter rate.
    chart.controls.filters.rate.set(chart);
}
