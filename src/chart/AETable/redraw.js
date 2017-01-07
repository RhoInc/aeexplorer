/*------------------------------------------------------------------------------------------------\
  Clear the current chart and draw a new one.
\------------------------------------------------------------------------------------------------*/

export function redraw(chart) {
	console.log(chart)
    chart.controls.search.clear(chart, chart.wrap);
    chart.AETable.wipe(chart.wrap);
    var filteredData = chart.AETable.prepareData(chart.wrap, chart.raw_data, chart.config.variables, chart.config);
    chart.AETable.init(chart, chart.wrap, filteredData, chart.config.variables, chart.config);
    chart.AETable.toggleRows(chart.wrap);
}
