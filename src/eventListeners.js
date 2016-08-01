import { rateFilter } from './eventListeners/rateFilter';
import { customFilters } from './eventListeners/customFilters';
import { search } from './eventListeners/search';

export const eventListeners =
    {rateFilter: rateFilter
    ,customFilters: customFilters
    ,search: search};
