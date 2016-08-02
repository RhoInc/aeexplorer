/*------------------------------------------------------------------------------------------------\
  Define rate filter object.
\------------------------------------------------------------------------------------------------*/

import { init } from './rate/init';
import { get } from './rate/get';
import { set } from './rate/set';

export const rate =
    {init: init
    ,get: get
    ,set: set};
