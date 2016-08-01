export function toggleRows(canvas) {
  ///////////////////////////////////
  // Apply basic Filters & Toggles //
  ///////////////////////////////////
  //Toggle Minor rows
    var minorToggle = true;//canvas.select("a.toggleRows").text() === "Show all nested rows"
    canvas.selectAll(".SummaryTable tbody").classed("minorHidden", minorToggle)
    canvas.selectAll(".SummaryTable table tbody").select("tr.major td.controls span")
        .text(minorToggle ? "+":"-")


  //Toggle Difference plots
    var differenceToggle = false;//canvas.select("a.toggleDiff").text() === "Show difference column"
    canvas.selectAll(".SummaryTable .diffplot").classed("hidden", differenceToggle)


  // Filter based on Prevalence
    var filterVal=canvas.select("div.controls input.rateFilter").property("value")
    canvas.selectAll("div.SummaryTable table tbody").each(function(d) {
        var allRows = d3.select(this).selectAll("tr")
        var filterRows = allRows.filter(function(d) {
            var maxVal= d3.max(d.values.map(function(element) {return element.values.per}))	
            return maxVal < filterVal
        })
        filterRows.classed("filter","true")
        var currentBody=d3.select(this);

      // show/hide arrows
        currentBody.select("tr.major td.controls span").classed("hidden",
            filterRows[0].length + 1 >= allRows[0].length
        )

    });
}
