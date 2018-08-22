export function draw(chart, data) {
    chart.detailTable.table = webCharts.createTable(
        //chart.config.container + ' .aeExplorer .aeTable .table-wrapper .DetailTable',
        '.DetailTable',
        {}
    );
    chart.detailTable.table.init(data);
}
