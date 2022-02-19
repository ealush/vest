import assign from 'assign';
import { createContext } from 'context';
import { createCursor } from 'cursor';

import { IsolateKeys, IsolateTypes } from 'IsolateTypes';
import { Modes } from 'Modes';
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
          inclusion: {},
          isolate: {
            type: IsolateTypes.DEFAULT,
            keys: {
              current: {},
              prev: {},
            },
          },
          mode: [Modes.ALL],
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
  inclusion: Record<string, boolean | (() => boolean)>;
  currentTest?: VestTest;
  groupName?: string;
  skipped?: boolean;
  omitted?: boolean;
  mode: [Modes];
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
