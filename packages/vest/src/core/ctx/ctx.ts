import assign from 'assign';
import { createContext } from 'context';
import { createCursor } from 'cursor';

import VestTest from 'VestTest';
import type { TStateRef } from 'createStateRef';

export default createContext<CTXType>((ctxRef, parentContext) =>
  parentContext
    ? null
    : assign(
        {},
        {
          testCursor: createCursor(),
          exclusion: {
            tests: {},
            groups: {},
          },
        },
        ctxRef
      )
);

type CTXType = {
  testCursor: ReturnType<typeof createCursor>;
  stateRef?: TStateRef;
  exclusion: {
    tests: Record<string, boolean>;
    groups: Record<string, boolean>;
  };
  currentTest?: VestTest;
  groupName?: string;
  skipped?: boolean;
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
