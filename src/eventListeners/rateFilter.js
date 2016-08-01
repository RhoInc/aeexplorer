export function rateFilter(table, canvas) {
    var rateFilter = canvas.select("input.rateFilter")

    rateFilter.on("change", function(d) {
      //remove all old filter flags
        canvas.selectAll(".SummaryTable table tbody tr").classed("filter",false)

      //add new filter flags as needed
        table.AETable.toggleRows(canvas) 
    });
}
