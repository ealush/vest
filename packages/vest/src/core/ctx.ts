import assign from 'assign';
import { createContext } from 'context';

import VestTest from 'VestTest';
import type { TStateRef } from 'createStateRef';

export default createContext<CTXType>((ctxRef, parentContext) =>
  parentContext
    ? null
    : assign(
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
  stateRef?: TStateRef;
  exclusion: {
    tests: Record<string, boolean>;
    groups: Record<string, boolean>;
  };
  currentTest?: VestTest;
  groupName?: string;
  skipped?: boolean;
};
