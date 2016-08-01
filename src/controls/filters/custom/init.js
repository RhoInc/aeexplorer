export function init(selector, data, vars, settings) {
  //Get list of categories for each selected filter
    var filterVars=vars["filters"].map(function(e) {
        return {key:e, values:[]};
    });

    filterVars.forEach(function(e) {
        var varLevels = d3.nest()
            .key(function(d){ return d[e.key]; })
            .entries(data);
        e.values = varLevels.map(function(d) {
            return d.key
        });
    });

  //Remove previous filters (if any)
    selector.selectAll("ul.nav").remove();

  //Add filters for each selected variable
    var filterCustomList = selector.append("ul").attr("class","nav");
    var filterCustom_li = filterCustomList
        .selectAll("li")
            .data(filterVars).enter()
        .append("li")
        .attr("class",function(d) {
            return "custom-"+d.key+" filterCustom";
        });
    var filterLabel  =  filterCustom_li.append("span")
        .attr("class","filterLabel")
        .text(function(d) {
            if (settings.filterSettings) {
                var filterLabel = settings.filterSettings.filter(function(d1) {
                    return d1.key === d.key;
                })[0].label;
                return filterLabel ? filterLabel : d.key;
            } else return d.key;
        });

    var filterCustom  =  filterCustom_li.append("select")
        .attr("multiple",true);

  //Add data-driven filter options 
    var filterItems = filterCustom
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
}
