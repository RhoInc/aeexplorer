export function init(selector) {
  //clear previous search bar (if any)
    selector.select("span.seach-label").remove()
    selector.select("input.searchBar").remove()

  //create search bar

    var searchLabel = selector.append("span")
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
}
