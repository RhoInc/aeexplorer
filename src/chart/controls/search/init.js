/*------------------------------------------------------------------------------------------------\
  Initialize search control.
\------------------------------------------------------------------------------------------------*/

export function init(chart) {
    //draw the search control
    var selector = chart.controls.wrap
        .append('div')
        .attr('class', 'searchForm wc-navbar-search pull-right')
        .attr('onsubmit', 'return false;');

    //Clear search control.
    selector.selectAll('span.seach-label, input.searchBar').remove();

    //Generate search control.
    var searchLabel = selector.append('span').attr('class', 'search-label label wc-hidden');
    searchLabel.append('span').attr('class', 'search-count');
    searchLabel.append('span').attr('class', 'clear-search').html('&#9747;');
    selector
        .append('input')
        .attr('type', 'text')
        .attr('class', 'searchBar search-query input-medium')
        .attr('placeholder', 'Search');

    //event listeners for search
    chart.wrap.select('input.searchBar').on('change', function(d) {
        var searchTerm = d3.select(this).property('value').toLowerCase();

        if (searchTerm.length > 0) {
            //Clear the previous search but preserve search text.
            chart.controls.search.clear(chart);
            d3.select(this).property('value', searchTerm);

            //Clear flags.
            chart.wrap.selectAll('div.SummaryTable table tbody').classed('minorHidden', false);
            chart.wrap.selectAll('div.SummaryTable table tbody tr').classed('filter', false);
            chart.wrap.select('div.SummaryTable').classed('search', false);
            chart.wrap.selectAll('div.SummaryTable table tbody').classed('search', false);
            chart.wrap.selectAll('div.SummaryTable table tbody tr').classed('search', false);

            //Hide expand/collapse cells.
            chart.wrap
                .selectAll('div.SummaryTable table tbody tr td.controls span')
                .classed('wc-hidden', true);

            //Display 'clear search' icon.
            chart.wrap.select('span.search-label').classed('wc-hidden', false);

            //Flag summary table.
            var tab = chart.wrap.select('div.SummaryTable').classed('search', true);

            //Capture rows which contain the search term.
            var tbodyMatch = tab.select('table').selectAll('tbody').each(function(bodyElement) {
                var bodyCurrent = d3.select(this);
                var bodyData = bodyCurrent.data()[0];

                bodyCurrent.selectAll('tr').each(function(rowElement) {
                    var rowCurrent = d3.select(this);
                    var rowData = rowCurrent.data()[0];
                    var rowText = rowCurrent.classed('major')
                        ? bodyData.key.toLowerCase()
                        : rowData.key.toLowerCase();

                    if (rowText.search(searchTerm) >= 0) {
                        bodyCurrent.classed('search', true);
                        rowCurrent.classed('search', true);

                        //Highlight search text in selected table cell.
                        var currentText = rowCurrent.select('td.rowLabel').html();
                        var searchStart = currentText.toLowerCase().search(searchTerm);
                        var searchStop = searchStart + searchTerm.length;
                        var newText =
                            currentText.slice(0, searchStart) +
                            '<span class="search">' +
                            currentText.slice(searchStart, searchStop) +
                            '</span>' +
                            currentText.slice(searchStop, currentText.length);
                        rowCurrent.select('td.rowLabel').html(newText);
                    }
                });
            });

            //Disable the rate filter.
            d3.select('input.rateFilter').property('disabled', true);

            //Update the search label.
            var matchCount = chart.wrap.selectAll('tr.search')[0].length;
            chart.wrap.select('span.search-count').text(matchCount + ' matches');
            chart.wrap
                .select('span.search-label')
                .attr(
                    'class',
                    matchCount === 0
                        ? 'search-label label label-warning'
                        : 'search-label label label-success'
                );

            //Check whether search term returned zero matches.
            if (matchCount === 0) {
                //Restore the table.
                chart.wrap.selectAll('div.SummaryTable').classed('search', false);
                chart.wrap.selectAll('div.SummaryTable table tbody').classed('search', false);
                chart.wrap.selectAll('div.SummaryTable table tbody tr').classed('search', false);

                //Reset the filters and row toggle.
                chart.AETable.toggleRows(chart);
            }
        } else chart.controls.search.clear(chart);
    });

    chart.wrap.select('span.clear-search').on('click', function() {
        chart.controls.search.clear(chart);
    });
}
