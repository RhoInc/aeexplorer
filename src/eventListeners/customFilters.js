/*------------------------------------------------------------------------------------------------\
  Define custom filters event listener.
\------------------------------------------------------------------------------------------------*/

export function customFilters(table, canvas, data, vars, settings) {
    var filterCustom = canvas.selectAll('.custom-filters ul li select');

  //Redraw table without bootstrap multiselect.
    filterCustom.on('change', function() {
        table.AETable.redraw(table, canvas, data, vars, settings);
    });
}
