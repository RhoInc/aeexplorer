export const eventListeners = {

    rateFilter: function(canvas) {
        const rateFilter = canvas.select("input.rateFilter")

        rateFilter.on("change", function(d) {
          //remove all old filter flags
            canvas.selectAll(".SummaryTable table tbody tr").classed("filter",false)

          //add new filter flags as needed
            table.AETable.toggleRows(canvas) 
        });
    },

    customFilters: function(canvas, data, vars, settings) {
        const filterCustom = canvas.selectAll(".custom-filters ul li select");

      //redraw table without bootstrap multiselect
        filterCustom.on('change', function() {
            table.AETable.redraw(canvas, data, data, vars, settings);
        });
    },

    search: function(canvas, data, vars, settings) {
        canvas.select("input.searchBar").on("change",function(d) {
            const searchTerm=d3.select(this).property("value").toLowerCase();

            if (searchTerm.length > 0) {

              //clear the previous search (but keep the seach text the same #hack)
                table.controls.search.clear(canvas);
                d3.select(this).property("value",searchTerm);

              //Show all minor rows and clear the filter
                canvas.selectAll("div.SummaryTable table tbody").classed("minorHidden",false);
                canvas.selectAll("div.SummaryTable table tbody tr").classed("filter",false);

              //clear previous search flags
                canvas.select("div.SummaryTable").classed("search",false);
                canvas.selectAll("div.SummaryTable table tbody").classed("search",false);
                canvas.selectAll("div.SummaryTable table tbody tr").classed("search",false);
                
              //change exapand/collapse cell to blank
                canvas.selectAll("div.SummaryTable table tbody tr td.controls span").classed("hidden",true);

              //show the "clear-search" icon
                canvas.select("span.search-label").classed("hidden",false);

              //flag the summary table as search
                const tab=canvas.select("div.SummaryTable");
                tab.classed("search",true);

              //get tbody areas that contain the search term
                const tbodyMatch = tab.select("table").selectAll("tbody")
                    .each(function(bodyElement) {
                        const bodyCurrent = d3.select(this);
                        const bodyData = bodyCurrent.data()[0];

                        bodyCurrent.selectAll("tr")
                            .each(function(rowElement) {
                                const rowCurrent = d3.select(this);
                                const rowData = rowCurrent.data()[0];
                                const rowText = rowCurrent.classed("major") ?
                                    bodyData.key.toLowerCase() :
                                    rowData.key.toLowerCase();

                                if (rowText.search(searchTerm) >= 0) {

                                    bodyCurrent.classed("search",true);
                                    rowCurrent.classed("search",true);

                                  //highlight the search text in the table cell. 
                                    const currentText = rowCurrent.select("td.rowLabel").html();
                                    const searchStart = currentText.toLowerCase().search(searchTerm);
                                    const searchStop  = searchStart + searchTerm.length;
                                    const newText     = currentText.slice(0,searchStart) + "<span class='search'>" + currentText.slice(searchStart,searchStop) + "</span>" + currentText.slice(searchStop,currentText.length);
                                    rowCurrent.select("td.rowLabel").html(newText);
                                }
                            });
                });

              //disable rate filter
                d3.select("input.rateFilter").property("disabled", true);

              //update the search label
                const matchCount = canvas.selectAll("tr.search")[0].length;
                canvas.select("span.search-count").text(matchCount + " matches ");
                canvas.select("span.search-label")
                    .attr("class", matchCount==0 ?
                          "search-label label label-warning" :
                          "search-label label label-success");

              //check for an empty search result
                if (matchCount === 0) {
                  //restore the table
                    canvas.selectAll("div.SummaryTable").classed("search",false);
                    canvas.selectAll("div.SummaryTable table tbody").classed("search",false);
                    canvas.selectAll("div.SummaryTable table tbody tr").classed("search",false);

                  //reset the filters and row toggle
                    table.AETable.toggleRows(canvas); //show/hide table rows as needed
                }
                
            } else {
                table.controls.search.clear(canvas)
            }
        });

        canvas.select("span.clear-search").on("click",function() {
            table.controls.search.clear(canvas);
        });
    }
}
