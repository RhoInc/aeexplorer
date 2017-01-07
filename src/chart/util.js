/*------------------------------------------------------------------------------------------------\
  Define util object.
\------------------------------------------------------------------------------------------------*/

import { calculateDifference } from './util/calculateDifference';
import { addDifferences } from './util/addDifferences';
import { cross } from './util/cross';
import { sort } from './util/sort';
import { fillRow } from './util/fillRow'
import { collapse } from './util/collapse'
import { json2csv } from './util/json2csv'
import { prepareData } from './util/prepareData'

export const util =
    {calculateDifference: calculateDifference
    ,addDifferences: addDifferences
    ,cross: cross
    ,sort: sort
	,fillRow: fillRow
	,collapse:collapse
	,json2csv:json2csv
	,prepareData:prepareData};
