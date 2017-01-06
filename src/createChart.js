import defaultSettings from './defaultSettings';
import { init } from './chart/init';
import { colorScale } from './chart/colorScale';
import { layout } from './chart/layout';
import { controls } from './chart/controls';
import { AETable } from './chart/AETable';
import { detailTable } from './chart/detailTable';
import { util } from './chart/util';

export function createChart(element = 'body', config = defaultSettings) {
    let chart =
        {element: element
        ,config: config
        ,init: init
        ,colorScale: colorScale
        ,layout: layout
        ,controls: controls
        ,AETable: AETable
        ,detailTable: detailTable
        ,util: util};

    return chart;
}
