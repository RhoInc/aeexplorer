/*------------------------------------------------------------------------------------------------\
  Define AETable object (the meat and potatoes).
\------------------------------------------------------------------------------------------------*/

import { redraw } from './AETable/redraw';
import { wipe } from './AETable/wipe';
import { prepareData } from './AETable/prepareData';
import { init } from './AETable/init';
import { toggleRows } from './AETable/toggleRows';

export const AETable =
    {redraw: redraw
    ,wipe: wipe
    ,prepareData: prepareData
    ,init: init
    ,toggleRows: toggleRows};
