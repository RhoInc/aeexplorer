/*------------------------------------------------------------------------------------------------\
  Define search control event listener.
\------------------------------------------------------------------------------------------------*/

export function search(table, canvas, data, vars, settings) {
    canvas.select('input.searchBar')
        .on('change',function(d) {
            var searchTerm = d3.select(this)
                .property('value')
                .toLowerCase();

            if (searchTerm.length > 0) {

              //Clear the previous search but preserve search text.
                table.controls.search.clear(table, canvas);
                d3.select(this)
                    .property('value', searchTerm);

              //Clear flags.
                canvas.selectAll('div.SummaryTable table tbody')
                    .classed('minorHidden', false);
                canvas.selectAll('div.SummaryTable table tbody tr')
                    .classed('filter', false);
                canvas.select('div.SummaryTable')
                    .classed('search', false);
                canvas.selectAll('div.SummaryTable table tbody')
                    .classed('search', false);
                canvas.selectAll('div.SummaryTable table tbody tr')
                    .classed('search', false);
                
              //Hide expand/collapse cells.
                canvas.selectAll('div.SummaryTable table tbody tr td.controls span')
                    .classed('hidden', true);

              //Display 'clear search' icon.
                canvas.select('span.search-label')
                    .classed('hidden', false);

              //Flag summary table.
                var tab = canvas.select('div.SummaryTable').classed('search', true);

              //Capture rows which contain the search term.
                var tbodyMatch = tab.select('table').selectAll('tbody')
                    .each(function(bodyElement) {
                        var bodyCurrent = d3.select(this);
                        var bodyData = bodyCurrent.data()[0];

                        bodyCurrent.selectAll('tr')
                            .each(function(rowElement) {
                                var rowCurrent = d3.select(this);
                                var rowData = rowCurrent.data()[0];
                                var rowText = rowCurrent.classed('major') ?
                                    bodyData.key.toLowerCase() :
                                    rowData.key.toLowerCase();

                                if (rowText.search(searchTerm) >= 0) {

                                    bodyCurrent
                                        .classed('search', true);
                                    rowCurrent
                                        .classed('search', true);

                                  //Highlight search text in selected table cell.
                                    var currentText = rowCurrent.select('td.rowLabel')
                                        .html();
                                    var searchStart = currentText
                                        .toLowerCase()
                                        .search(searchTerm);
                                    var searchStop = searchStart + searchTerm.length;
                                    var newText = currentText
                                        .slice(0, searchStart) +
                                        '<span class="search">' +
                                        currentText.slice(searchStart, searchStop) +
                                        '</span>' +
                                        currentText.slice(searchStop, currentText.length);
                                    rowCurrent.select('td.rowLabel')
                                        .html(newText);
                                }
                            });
                });

              //Disable the rate filter.
                d3.select('input.rateFilter')
                    .property('disabled', true);

              //Update the search label.
                var matchCount = canvas.selectAll('tr.search')[0].length;
                canvas.select('span.search-count').text(matchCount + ' matches');
                canvas.select('span.search-label')
                    .attr('class', matchCount === 0 ?
                        'search-label label label-warning' :
                        'search-label label label-success');

              //Check whether search term returned zero matches.
                if (matchCount === 0) {
                  //Restore the table.
                    canvas.selectAll('div.SummaryTable')
                        .classed('search', false);
                    canvas.selectAll('div.SummaryTable table tbody')
                        .classed('search', false);
                    canvas.selectAll('div.SummaryTable table tbody tr')
                        .classed('search', false);

                  //Reset the filters and row toggle.
                    table.AETable.toggleRows(canvas);
                }
            } else  table.controls.search.clear(table, canvas)
        });

    canvas.select('span.clear-search')
        .on('click', function() {
            table.controls.search.clear(table, canvas);
        });
}
