export function init(selector) {
  //remove previous version (if any)
    selector.select("span.filterLabel").remove();
    selector.select("div.rateFilterDiv").remove();

  //Add new rate filter
    selector.append("span").html("Prevalence &#8805;&nbsp;");

    var filterRate=selector.append("div")
    .attr("class","rateFilterDiv");
    filterRate.append("input")
        .attr("class","rateFilter")
        .attr("type","text");
    selector.append("span").text("%");
}
