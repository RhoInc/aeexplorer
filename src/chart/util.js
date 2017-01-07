/*------------------------------------------------------------------------------------------------\
  Define util object.
\------------------------------------------------------------------------------------------------*/

import { calculateDifference } from './util/calculateDifference';
import { addDifferences } from './util/addDifferences';
import { cross } from './util/cross';
import { sort } from './util/sort';
import { fillRow } from './util/fillRow'

export const util =
    {calculateDifference: calculateDifference
    ,addDifferences: addDifferences
    ,cross: cross
    ,sort: sort
	,fillRow: fillRow};
