import assign from 'assign';
import { createContext } from 'context';

import VestTest from 'VestTest';
import type { TStateRef } from 'createStateRef';
import { PocketType } from 'pocket';

export default createContext<CTXType>((ctxRef, parentContext) =>
  parentContext
    ? null
    : assign(
        {},
        {
          cursorAt: [],
          exclusion: {
            tests: {},
            groups: {},
          },
        },
        ctxRef
      )
);

type CTXType = {
  cursorAt: number[];
  stateRef?: TStateRef;
  exclusion: {
    tests: Record<string, boolean>;
    groups: Record<string, boolean>;
  };
  pocket?: { type: PocketType };
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
