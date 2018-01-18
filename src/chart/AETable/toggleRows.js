/*------------------------------------------------------------------------------------------------\
  Apply basic filters and toggles.
\------------------------------------------------------------------------------------------------*/

export function toggleRows(chart) {
    //Toggle minor rows.
    var minorToggle = !chart.config.defaults.prefTerms;
    chart.wrap.selectAll('.SummaryTable tbody').classed('minorHidden', minorToggle);
    chart.wrap
        .selectAll('.SummaryTable table tbody')
        .select('tr.major td.controls span')
        .text(minorToggle ? '+' : '-');

    //Toggle Difference plots
    var differenceToggle = false;
    chart.wrap.selectAll('.SummaryTable .diffplot').classed('hidden', differenceToggle);

    //Filter based on prevalence.
    var filterVal = chart.wrap.select('div.controls input.rateFilter').property('value');
    chart.wrap.selectAll('div.SummaryTable table tbody').each(function(d) {
        var allRows = d3.select(this).selectAll('tr');
        var filterRows = allRows.filter(function(d) {
            var percents = d.values
                .filter(function(d) {
                    //only keep the total column if groupColumns are hidden (otherwise keep all columns)
                    return chart.config.defaults.groupCols ? true : d.key == 'Total';
                })
                .map(function(element) {
                    return element.values.per;
                });
            var maxPercent = d3.max(percents);

            return maxPercent < filterVal;
        });
        filterRows.classed('filter', 'true');

        d3
            .select(this)
            .select('tr.major td.controls span')
            .classed('hidden', filterRows[0].length + 1 >= allRows[0].length);
    });
}
