/*------------------------------------------------------------------------------------------------\
  Define event listener object.
\------------------------------------------------------------------------------------------------*/

import { rateFilter } from './eventListeners/rateFilter';
import { summaryControl } from './eventListeners/summaryControl';
import { customFilters } from './eventListeners/customFilters';
import { search } from './eventListeners/search';

export const eventListeners =
    {rateFilter: rateFilter
    ,summaryControl: summaryControl
    ,customFilters: customFilters
    ,search: search};
