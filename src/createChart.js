import { init } from './chart/init';
import colorScale from './chart/colorScale';
import { layout } from './chart/layout';
import { controls } from './chart/controls';
import { AETable } from './chart/AETable';
import { detailTable } from './chart/detailTable';
import { util } from './chart/util';

export function createChart(element = 'body', config) {
    const chart = {
        element: element,
        config: config,
        init: init,
        layout: layout,
        controls: controls,
        AETable: AETable,
        detailTable: detailTable,
        util: util
    };

    chart.wrap = d3.select(element).append('div').classed('aeExplorer', true);
    util.setDefaults(chart);
    chart.colorScale = colorScale(chart.config.colors.slice());
    chart.layout();

    return chart;
}
