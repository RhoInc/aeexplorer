/*------------------------------------------------------------------------------------------------\
  Clear the current table and draw a new one.
\------------------------------------------------------------------------------------------------*/

export function redraw(table, canvas, data, vars, settings) {
    table.controls.search.clear(table, canvas) //Reset the search bar
    table.AETable.wipe(canvas) //clear previous tables
    var data_filtered = table.AETable.prepareData(canvas, data,vars,settings) //get the data ready
    table.AETable.init(table, canvas, data_filtered, vars, settings) // draw the table
    table.AETable.toggleRows(canvas) //show/hide table rows as needed
}
