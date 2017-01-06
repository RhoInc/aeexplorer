/*------------------------------------------------------------------------------------------------\
  Initialize search control.
\------------------------------------------------------------------------------------------------*/

export function init(chart) {
  //draw the search control
  var selector = chart.controls.wrap
        .append('form')
        .attr('class', 'searchForm navbar-search pull-right')
        .attr('onsubmit', 'return false;');

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
