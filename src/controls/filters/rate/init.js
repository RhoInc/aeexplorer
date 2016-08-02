/*------------------------------------------------------------------------------------------------\
  Initialize rate filter.
\------------------------------------------------------------------------------------------------*/

export function init(selector) {
  //Clear rate filter.
    selector.selectAll('span.filterLabel, div.rateFilterDiv').remove();

  //Generate rate filter.
    selector
        .append('span')
        .html('Prevalence &#8805;&nbsp;');

    var rateFilter = selector
        .append('div')
        .attr('class', 'rateFilterDiv');
    rateFilter
        .append('input')
        .attr('class', 'rateFilter')
        .attr('type', 'text');
    selector
        .append('span')
        .text('%');
}
