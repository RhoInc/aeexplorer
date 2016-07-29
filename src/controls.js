export const controls = {

    init: function(canvas, data, vars, settings) {
        const controls = canvas.select("div.controls");
        controls.attr("onsubmit","return false;");

      //remove previous controls (if any)
        controls.selectAll("*").remove();

      //layout the controls form
        const rateFilter = controls.append("div").attr("class","rate-filter");
        const searchBox = controls.append("form")
            .attr("class","searchForm navbar-search pull-right")
            .attr("onsubmit","return false;");
        const customFilters = controls.append("div").attr("class","custom-filters");

      //draw UI components
        table.controls.filters.rate.init(rateFilter);
        table.controls.filters.custom.init(customFilters, data,vars,settings);
        table.controls.search.init(searchBox);

      //initialize the filter rate
        table.controls.filters.rate.set(canvas, settings);
    },

    filters: {
        rate: {
            init: function(selector){  
              //remove previous version (if any)
                selector.select("span.filterLabel").remove();
                selector.select("div.rateFilterDiv").remove();

              //Add new rate filter
                selector.append("span").html("Prevalence &#8805;&nbsp;");

                const filterRate=selector.append("div")
                .attr("class","rateFilterDiv");
                filterRate.append("input")
                    .attr("class","rateFilter")
                    .attr("type","text");
                selector.append("span").text("%");
            },

            get: function(){},

            set: function(canvas, settings) {
                if (settings.defaults !== undefined) {
                    if (settings.defaults.maxPrevalence !== undefined) {
                        canvas.select("div.controls input.rateFilter")
                            .property("value",settings.defaults.maxPrevalence);
                    }
                }
            }
        },

        custom: {
            init: function(selector, data, vars, settings) {
              //Get list of categories for each selected filter
                const filterVars=vars["filters"].map(function(e) {
                    return {key:e, values:[]};
                });

                filterVars.forEach(function(e) {
                    const varLevels = d3.nest()
                        .key(function(d){ return d[e.key]; })
                        .entries(data);
                    e.values = varLevels.map(function(d) {
                        return d.key
                    });
                });

              //Remove previous filters (if any)
                selector.selectAll("ul.nav").remove();

              //Add filters for each selected variable
                const filterCustomList = selector.append("ul").attr("class","nav");
                const filterCustom_li = filterCustomList
                    .selectAll("li")
                        .data(filterVars).enter()
                    .append("li")
                    .attr("class",function(d) {
                        return "custom-"+d.key+" filterCustom";
                    });
                const filterLabel  =  filterCustom_li.append("span")
                    .attr("class","filterLabel")
                    .text(function(d) {
                        if (settings.filterSettings) {
                            const filterLabel = settings.filterSettings.filter(function(d1) {
                                return d1.key === d.key;
                            })[0].label;
                            return filterLabel ? filterLabel : d.key;
                        } else return d.key;
                    });

                const filterCustom  =  filterCustom_li.append("select")
                    .attr("multiple",true);

              //Add data-driven filter options 
                const filterItems = filterCustom
                    .selectAll("option")
                        .data(function(d) {
                            return d.values.filter(function(d) {
                                return ["NA",""," "].indexOf(d) === -1;
                            });
                        }).enter()
                    .append("option")
                    .html(function(d) {
                            return  "<span><i class = 'icon-remove icon-white fa fa-times'></i></span>"
                                +   (["NA",""," "].indexOf(d) > -1 ? "[None]" : d);
                        })
                    .attr("value",function(d){return d})
                    .attr("selected","selected");

            },

            get: function(){},

            set: function(){}
        }
    },

    search: {
        init: function(selector) {
          //clear previous search bar (if any)
            selector.select("span.seach-label").remove()
            selector.select("input.searchBar").remove()

          //create search bar

            const searchLabel = selector.append("span")
                .attr("class","search-label label hidden")
            searchLabel.append("span")
                .attr("class","search-count")
            searchLabel.append("span")
                .attr("class","clear-search")
                .html("&#9747;")
            selector.append("input")
                .attr("type","text")
                .attr("class","searchBar search-query input-medium")
                .attr("placeholder","Search")
        },

        get: function(){},

        set: function(){},

        clear: function(canvas) {
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
    }

}
