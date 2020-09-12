import {
  EXCLUSION_ITEM_TYPE_TESTS,
  EXCLUSION_ITEM_TYPE_GROUPS,
} from '../../hooks/exclusive/constants';
import createContext from '../../lib/createContext';

export default createContext((ctxRef, parentContext) =>
  parentContext
    ? null
    : Object.assign({}, ctxRef, {
        exclusion: {
          [EXCLUSION_ITEM_TYPE_TESTS]: {},
          [EXCLUSION_ITEM_TYPE_GROUPS]: {},
        },
      })
);
