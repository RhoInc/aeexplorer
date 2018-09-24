/*------------------------------------------------------------------------------------------------\
  Generate data listing.
\------------------------------------------------------------------------------------------------*/
import { makeDetailData } from './makeDetailData';
import { toggleControls } from './toggleControls';
import { makeTitle } from './makeTitle';
import { layout } from './layout';
import { draw as drawWebcharts } from './webchartsTable/draw';
import { draw as drawSimple } from './simpleTable/draw';

export function init(chart, detailTableSettings) {
    const detailData = makeDetailData(chart, detailTableSettings);
    layout(chart);
    makeTitle(chart, detailData, detailTableSettings);
    toggleControls(chart);

    //initialize and draw the chart either using webcharts or raw D3
    if (chart.config.defaults.webchartsDetailTable) {
        drawWebcharts(chart, detailData);
    } else {
        drawSimple(chart, detailData);
    }
}
