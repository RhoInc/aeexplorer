/*------------------------------------------------------------------------------------------------\
  Initialize controls.
\------------------------------------------------------------------------------------------------*/

export function init(chart) {
    var controls = chart.wrap.select('div.controls');
    controls
        .attr('onsubmit', 'return false;');

  //Clear controls.
    controls.selectAll('*').remove();

  //Generate HTML containers.
    var rateFilter = controls
        .append('div')
        .attr('class', 'rate-filter');
    var summaryControl = controls
        .append('div')
        .attr('class', 'summary-control');
    var searchBox = controls
        .append('form')
        .attr('class', 'searchForm navbar-search pull-right')
        .attr('onsubmit', 'return false;');
    var customFilters = controls
        .append('div')
        .attr('class', 'custom-filters');

  //Draw UI component.
    chart.controls.filters.rate.init(rateFilter);
    chart.controls.summaryControl.init(summaryControl);
    chart.controls.filters.custom.init(customFilters, chart.raw_data, chart.config.variables, chart.config);
    chart.controls.search.init(searchBox);

  //Initialize the filter rate.
    chart.controls.filters.rate.set(chart.wrap, chart.config);
}
