/*------------------------------------------------------------------------------------------------\
  Clear search term results.
\------------------------------------------------------------------------------------------------*/

export function clear(chart) {

  //Re-enable rate filter.
    chart.wrap.select('input.rateFilter')
        .property('disabled', false);

  //Clear search box.
    chart.wrap.select('input.searchBar')
        .property('value', '')

  //Remove search highlighting.
    chart.wrap.selectAll('div.SummaryTable table tbody tr.search td.rowLabel')
        .html(function(d) {
            return d.values[0].values['label']; });

  //Remove 'clear search' icon and label.
    chart.wrap.select('span.search-label')
        .classed('hidden',true)

  //Clear search flags.
    chart.wrap.selectAll('div.SummaryTable')
        .classed('search', false);
    chart.wrap.selectAll('div.SummaryTable table tbody')
        .classed('search', false);
    chart.wrap.selectAll('div.SummaryTable table tbody tr')
        .classed('search', false);

  //Reset filters and row toggle.
    chart.AETable.toggleRows(chart.wrap);
}
