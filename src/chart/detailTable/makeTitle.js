export function makeTitle(chart, detailData, detailTableSettings) {
    //Add explanatory listing title.
    chart.detailTable.head
        .append('h4')
        .html(
            detailTableSettings.minor === 'All'
                ? 'Details for ' +
                      detailData.length +
                      ' <b>' +
                      detailTableSettings.major +
                      '</b> records'
                : 'Details for ' +
                      detailData.length +
                      ' <b>' +
                      detailTableSettings.minor +
                      ' (' +
                      detailTableSettings.major +
                      ')</b> records'
        );
}
