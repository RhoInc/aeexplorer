export function init(table, canvas, data, vars, settings) {
    var controls = canvas.select("div.controls");
    controls.attr("onsubmit","return false;");

  //remove previous controls (if any)
    controls.selectAll("*").remove();

  //layout the controls form
    var rateFilter = controls.append("div").attr("class","rate-filter");
    var searchBox = controls.append("form")
        .attr("class","searchForm navbar-search pull-right")
        .attr("onsubmit","return false;");
    var customFilters = controls.append("div").attr("class","custom-filters");

  //draw UI components
    table.controls.filters.rate.init(rateFilter);
    table.controls.filters.custom.init(customFilters, data,vars,settings);
    table.controls.search.init(searchBox);

  //initialize the filter rate
    table.controls.filters.rate.set(canvas, settings);
}
