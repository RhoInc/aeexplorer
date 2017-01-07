/*------------------------------------------------------------------------------------------------\
  Clear the current chart and draw a new one.
\------------------------------------------------------------------------------------------------*/

export function redraw(chart) {
    chart.controls.search.clear(chart);
    chart.AETable.wipe(chart.wrap);
    var filteredData = chart.AETable.prepareData(chart);
    chart.AETable.init(chart);
    chart.AETable.toggleRows(chart.wrap);
}
