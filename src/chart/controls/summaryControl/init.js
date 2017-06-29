/*------------------------------------------------------------------------------------------------\

  Initialize summary control.

\------------------------------------------------------------------------------------------------*/

export function init(chart) {
    //set the initial summary status
    chart.config.summary = chart.config.defaults.summarizeBy

    //create element
    var selector = chart.controls.wrap.append('div').attr('class', 'summary-control');

    //Clear summary control.
    selector.selectAll('div.summaryDiv').remove();

    //Generate summary control.
    selector.append('span').attr('class', 'sectionHead').text('Summarize by:');

    var summaryControl = selector
        .append('div')
        .attr('class', 'input-prepend input-append input-medium summaryDiv');
    summaryControl
        .selectAll('div')
        .data(['participant', 'event'])
        .enter()
        .append('div')
        .append('label')
        .style('font-weight', d => (d === chart.config.summary ? 'bold' : null))
        .text(d => d)
        .append('input')
        .attr({
            class: 'appendedPrependedInput summaryRadio',
            type: 'radio'
        })
        .property('checked', d => d === chart.config.summary);

    //initialize event listener
    var radios = chart.wrap.selectAll('div.summaryDiv .summaryRadio');
    radios.on('change', function(d) {
        radios.each(function(di) {
            d3.select(this.parentNode).style('font-weight', 'normal');
            d3.select(this)[0][0].checked = false;
        });
        d3.select(this)[0][0].checked = true;
        d3.select(this.parentNode).style('font-weight', 'bold');
        chart.config.summary = d3.select(this.parentNode)[0][0].textContent;
        chart.AETable.redraw(chart);
    });
}
