import { createCascade } from 'context';
import { assign, CB } from 'vest-utils';

import { Isolate, IsolateTypes } from 'IsolateTypes';
import { Modes } from 'Modes';
import VestTest from 'VestTest';
import type { StateRef } from 'createStateRef';
import { generateIsolate } from 'generateIsolate';

export default createCascade<CTXType>((ctxRef, parentContext) =>
  parentContext
    ? null
    : assign(
        {
          exclusion: {
            tests: {},
            groups: {},
          },
          inclusion: {},
          isolate: generateIsolate(IsolateTypes.DEFAULT),
          mode: [Modes.ALL],
        },
        ctxRef
      )
);

type CTXType = {
  isolate: Isolate;
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
};
