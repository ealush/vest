import assign from 'assign';
import { createContext } from 'context';
import { createCursor, Cursor } from 'cursor';
import { CB } from 'utilityTypes';

import { IsolateKeys, IsolateTypes } from 'IsolateTypes';
import { Modes } from 'Modes';
import VestTest from 'VestTest';
import type { StateRef } from 'createStateRef';
import { SuiteSummary } from 'genTestsSummary';

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
  testCursor: Cursor;
  stateRef?: StateRef;
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
      handler: CB
    ) => {
      off: () => void;
    };
    emit: (event: string, ...args: any[]) => void;
  };
  summary?: SuiteSummary;
};
