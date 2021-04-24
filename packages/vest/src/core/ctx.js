import createContext from 'context';

import {
  EXCLUSION_ITEM_TYPE_TESTS,
  EXCLUSION_ITEM_TYPE_GROUPS,
} from 'runnableTypes';

const context = createContext((ctxRef, parentContext) =>
  parentContext
    ? null
    : Object.assign(
        {},
        {
          exclusion: {
            [EXCLUSION_ITEM_TYPE_TESTS]: {},
            [EXCLUSION_ITEM_TYPE_GROUPS]: {},
          },
        },
        ctxRef
      )
);

export default context;
