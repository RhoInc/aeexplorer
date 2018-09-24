export function layout(chart) {
    chart.detailTable.wrap = chart.wrap
        .select('div.table-wrapper')
        .append('div')
        .attr('class', 'DetailTable');

    chart.detailTable.head = chart.wrap
        .select('div.table-wrapper')
        .insert('div', '.controls')
        .attr('class', 'DetailHeader');

    //Add button to return to standard view.
    var closeButton = chart.detailTable.head
        .append('button')
        .attr('class', 'closeDetailTable btn btn-primary');

    closeButton.html(
        '<i class="icon-backward icon-white fa fa-backward"></i>    Return to the Summary View'
    );

    closeButton.on('click', () => {
        chart.wrap.select('.SummaryTable table').classed('summary', false);
        chart.wrap.select('div.controls').selectAll('div').classed('wc-hidden', false);
        chart.wrap
            .select('div.controls')
            .select('div.custom-filters')
            .selectAll('select')
            .property('disabled', '');
        chart.wrap.selectAll('.SummaryTable table tbody tr').classed('wc-active', false);
        if (chart.config.defaults.webchartsDetailTable) {
            chart.detailTable.table.destroy();
        }
        chart.detailTable.wrap.remove();
        chart.detailTable.head.remove();
    });
}
