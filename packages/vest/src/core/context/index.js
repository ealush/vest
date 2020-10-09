import createContext from 'context';
import {
  EXCLUSION_ITEM_TYPE_TESTS,
  EXCLUSION_ITEM_TYPE_GROUPS,
} from '../../hooks/exclusive/constants';

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

export function bindContext(ctxRef, fn, ...args) {
  return function (...runTimeArgs) {
    return context.run(ctxRef, () => fn(...args, ...runTimeArgs));
  };
}

export default context;
