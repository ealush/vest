import createContext from 'context';

import VestTest from 'VestTest';
import createStateRef from 'createStateRef';

export default createContext<CTXType>((ctxRef, parentContext) =>
  parentContext
    ? null
    : Object.assign(
        {},
        {
          exclusion: {
            tests: {},
            groups: {},
          },
        },
        ctxRef
      )
);

type CTXType = {
  stateRef?: ReturnType<typeof createStateRef>;
  exclusion?: {
    tests: Record<string, boolean>;
    groups: Record<string, boolean>;
  };
  currentTest?: VestTest;
  groupName?: string;
};
