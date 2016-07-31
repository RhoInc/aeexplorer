//import { table } from './table';
import { util } from './util';
import { init } from './init';
import { colorScale } from './colorScale';
import { layout } from './layout';
import { controls } from './controls';
import { eventListeners } from './eventListeners';
import { AETable } from './AETable';
import { detailTable } from './detailTable';

export default function aeTable() {
    const table =
        {util: util
        ,init: init
        ,colorScale: colorScale
        ,layout: layout
        ,controls: controls
        ,eventListeners: eventListeners
        ,AETable: AETable
        ,detailTable: detailTable};

    return table;
}
