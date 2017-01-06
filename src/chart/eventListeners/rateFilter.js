/*------------------------------------------------------------------------------------------------\
  Define rate filter event listener.
\------------------------------------------------------------------------------------------------*/

export function rateFilter(table, canvas) {
    var rateFilter = canvas.select('input.rateFilter');

    rateFilter.on('change', function(d) {
      //Clear filter flags.
        canvas.selectAll('.SummaryTable table tbody tr')
            .classed('filter', false);

      //Add filter flags.
        table.AETable.toggleRows(canvas) ;
    });
}
