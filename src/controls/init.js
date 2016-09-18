/*------------------------------------------------------------------------------------------------\
  Initialize controls.
\------------------------------------------------------------------------------------------------*/

export function init(table, canvas, data, vars, settings) {
    var controls = canvas.select('div.controls');
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
    table.controls.filters.rate.init(rateFilter);
    table.controls.summaryControl.init(summaryControl);
    table.controls.filters.custom.init(customFilters, data, vars, settings);
    table.controls.search.init(searchBox);

  //Initialize the filter rate.
    table.controls.filters.rate.set(canvas, settings);
}
