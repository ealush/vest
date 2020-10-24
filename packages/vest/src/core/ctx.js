import createContext from 'context';

import {
  EXCLUSION_ITEM_TYPE_TESTS,
  EXCLUSION_ITEM_TYPE_GROUPS,
} from 'runnableTypes';

const context = createContext((ctxRef, parentContext) =>
  parentContext
    ? null
    : Object.assign({}, ctxRef, {
        exclusion: {
          [EXCLUSION_ITEM_TYPE_TESTS]: {},
          [EXCLUSION_ITEM_TYPE_GROUPS]: {},
        },
      })
);

export default context;
