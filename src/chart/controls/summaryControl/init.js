/*------------------------------------------------------------------------------------------------\

  Initialize summary control.

\------------------------------------------------------------------------------------------------*/

export function init(chart) {
  //create element  
    var selector = chart.controls.wrap
        .append('div')
        .attr('class', 'summary-control');

  //Clear summary control.
    selector.selectAll('div.summaryDiv').remove();

  //Generate summary control.
    selector
        .append('span')
        .attr('class', 'sectionHead')
        .text('Summarize by:');

    var summaryControl = selector
        .append('div')
        .attr('class', 'input-prepend input-append input-medium summaryDiv');
    summaryControl
        .append('div')
            .append('label')
            .style('font-weight', 'bold')
            .text('participant')
                .append('input')
                .attr(
                    {'class': 'appendedPrependedInput summaryRadio'
                    ,'type': 'radio'
                    ,'checked': true});
    summaryControl
        .append('div')
            .append('label')
            .text('event')
                .append('input')
                .attr(
                    {'class': 'appendedPrependedInput summaryRadio'
                    ,'type': 'radio'});
}
