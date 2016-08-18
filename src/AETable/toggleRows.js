/*------------------------------------------------------------------------------------------------\
  Apply basic filters and toggles.
\------------------------------------------------------------------------------------------------*/

export function toggleRows(canvas) {
  //Toggle minor rows.
    var minorToggle = (settings.defaults.prefTerms !== 'Show');
    canvas.selectAll('.SummaryTable tbody')
        .classed('minorHidden', minorToggle);
    canvas.selectAll('.SummaryTable table tbody').select('tr.major td.controls span')
        .text(minorToggle ? '+':'-');

  //Toggle Difference plots
    var differenceToggle = false;
    canvas.selectAll('.SummaryTable .diffplot')
        .classed('hidden', differenceToggle);

  //Filter based on prevalence.
    var filterVal = canvas.select('div.controls input.rateFilter').property('value');
    canvas.selectAll('div.SummaryTable table tbody')
        .each(function(d) {
            var allRows = d3.select(this).selectAll('tr');
            var filterRows = allRows.filter(function(d) {
                var percents = d.values.map(function(element) {
                    return element.values.per; });
                var maxPercent = d3.max(percents);

                return maxPercent < filterVal;
            });
            filterRows
                .classed('filter','true');

            d3.select(this).select('tr.major td.controls span')
                .classed('hidden', (filterRows[0].length + 1) >= allRows[0].length);
        });
}
