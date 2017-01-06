/*------------------------------------------------------------------------------------------------\
  Initialize rate filter.
\------------------------------------------------------------------------------------------------*/

export function init(selector) {
  //Clear rate filter.
    selector.selectAll('span.filterLabel, div.rateFilterDiv').remove();

  //Generate rate filter.
    selector
        .append('span')
        .attr('class', 'sectionHead')
        .text('Filter by prevalence:');

    var rateFilter = selector
        .append('div')
        .attr('class', 'input-prepend input-append input-medium rateFilterDiv');
    rateFilter
        .append('span')
        .attr('class', 'add-on before')
        .html('&#8805;')
    rateFilter
        .append('input')
        .attr(
            {'class': 'appendedPrependedInput rateFilter'
            ,'type': 'text'})
    rateFilter
        .append('span')
        .attr('class', 'add-on after')
        .text('%')
}
