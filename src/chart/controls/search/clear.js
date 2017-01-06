/*------------------------------------------------------------------------------------------------\
  Clear search term results.
\------------------------------------------------------------------------------------------------*/

export function clear(table, canvas) {
  //Re-enable rate filter.
    canvas.select('input.rateFilter')
        .property('disabled', false);

  //Clear search box.
    canvas.select('input.searchBar')
        .property('value', '')

  //Remove search highlighting.
    canvas.selectAll('div.SummaryTable table tbody tr.search td.rowLabel')
        .html(function(d) {
            return d.values[0].values['label']; });

  //Remove 'clear search' icon and label.
    canvas.select('span.search-label')
        .classed('hidden',true)

  //Clear search flags.
    canvas.selectAll('div.SummaryTable')
        .classed('search', false);
    canvas.selectAll('div.SummaryTable table tbody')
        .classed('search', false);
    canvas.selectAll('div.SummaryTable table tbody tr')
        .classed('search', false);

  //Reset filters and row toggle.
    table.AETable.toggleRows(canvas);
}
