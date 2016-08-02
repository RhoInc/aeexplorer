/*------------------------------------------------------------------------------------------------\
  Clear the current table and draw a new one.
\------------------------------------------------------------------------------------------------*/

export function redraw(table, canvas, data, vars, settings) {
    table.controls.search.clear(table, canvas);
    table.AETable.wipe(canvas);
    var filteredData = table.AETable.prepareData(canvas, data, vars, settings);
    table.AETable.init(table, canvas, filteredData, vars, settings);
    table.AETable.toggleRows(canvas);
}
