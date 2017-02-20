/*------------------------------------------------------------------------------------------------\
  Define controls object.
\------------------------------------------------------------------------------------------------*/

import { init } from './controls/init';
import { filters } from './controls/filters';
import { summaryControl } from './controls/summaryControl';
import { search } from './controls/search';

export const controls =
    {init: init
    ,filters: filters
    ,summaryControl: summaryControl
    ,search: search};
