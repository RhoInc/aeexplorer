export function clear(table, canvas) {
  //un-disable rate filter
    canvas.select("input.rateFilter").property("disabled", false);

  //Set the search box to blank
    canvas.select("input.searchBar").property("value","")

  //Remove search highlighting
    canvas.selectAll("div.SummaryTable table tbody tr.search td.rowLabel").html(function(d){return d.values[0].values["label"]}) 

  //hide the "clear-search" icon and label
    canvas.select("span.search-label").classed("hidden",true)

  //clear search flags
    canvas.selectAll("div.SummaryTable").classed("search",false)
    canvas.selectAll("div.SummaryTable table tbody").classed("search",false)
    canvas.selectAll("div.SummaryTable table tbody tr").classed("search",false)

  //reset the filters and row toggle
    table.AETable.toggleRows(canvas) //show/hide table rows as needed
}
