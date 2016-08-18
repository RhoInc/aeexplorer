import { init } from './init';
import { colorScale } from './colorScale';
import { layout } from './layout';
import { controls } from './controls';
import { eventListeners } from './eventListeners';
import { AETable } from './AETable';
import { detailTable } from './detailTable';
import { util } from './util';

const table =
    {init: init
    ,colorScale: colorScale
    ,layout: layout
    ,controls: controls
    ,eventListeners: eventListeners
    ,AETable: AETable
    ,detailTable: detailTable
    ,util: util};

export default table;
