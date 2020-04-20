import { init } from './chart/init';
import { colors } from './chart/defaultSettings';
import colorScale from './chart/colorScale';
import { layout } from './chart/layout';
import { controls } from './chart/controls';
import { AETable } from './chart/AETable';
import { detailTable } from './chart/detailTable';
import { util } from './chart/util';

export function createChart(element = 'body', config = {}) {
    const chart = {
        element: element,
        config: config,
        init: init,
        colorScale: colorScale(
            Array.isArray(config.colors) && config.colors.length
                ? config.colors.slice()
                : colors.slice()
        ),
        layout: layout,
        controls: controls,
        AETable: AETable,
        detailTable: detailTable,
        util: util
    };

    return chart;
}
