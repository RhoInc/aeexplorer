/*------------------------------------------------------------------------------------------------\
  Generate HTML containers.
\------------------------------------------------------------------------------------------------*/

export function layout() {
    var wrapper = this.wrap
        .append('div')
        .attr('class', 'aeTable')
        .append('div')
        .attr('class', 'table-wrapper');
    wrapper.append('div').attr('class', 'controls');
    wrapper.append('div').attr('class', 'SummaryTable');
    if (this.config.validation)
        this.wrap
            .append('a')
            .attr({
                id: 'downloadCSV'
            })
            .text('Download Summarized Data');
}
