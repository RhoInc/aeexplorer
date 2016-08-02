/*------------------------------------------------------------------------------------------------\
  Initialize search control.
\------------------------------------------------------------------------------------------------*/

export function init(selector) {
  //Clear search control.
    selector.selectAll('span.seach-label, input.searchBar').remove()

  //Generate search control.
    var searchLabel = selector.append('span')
        .attr('class', 'search-label label hidden');
    searchLabel.append('span')
        .attr('class', 'search-count');
    searchLabel.append('span')
        .attr('class', 'clear-search')
        .html('&#9747;');
    selector.append('input')
        .attr('type', 'text')
        .attr('class', 'searchBar search-query input-medium')
        .attr('placeholder', 'Search');
}
