import assign from 'assign';
import { createContext } from 'context';
import { createCursor } from 'cursor';

import { IsolateKeys, IsolateTypes } from 'IsolateTypes';
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
          isolate: {
            type: IsolateTypes.DEFAULT,
            keys: {
              current: {},
              prev: {},
            },
          },
          testCursor: createCursor(),
        },
        ctxRef
      )
);

type CTXType = {
  isolate: {
    type: IsolateTypes;
    keys: IsolateKeys;
  };
  testCursor: ReturnType<typeof createCursor>;
  stateRef?: TStateRef;
  exclusion: {
    tests: Record<string, boolean>;
    groups: Record<string, boolean>;
  };
  currentTest?: VestTest;
  groupName?: string;
  skipped?: boolean;
  omitted?: boolean;
  bus?: {
    on: (
      event: string,
      handler: (...args: any[]) => void
    ) => {
      off: () => void;
    };
    emit: (event: string, ...args: any[]) => void;
  };
};
