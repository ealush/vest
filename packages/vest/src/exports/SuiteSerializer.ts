import { assign } from 'vest-utils';
import { IsolateSerializer } from 'vestjs-runtime';

import { CommonStates } from 'CommonStateMachine';
import { TIsolateSuite } from 'IsolateSuite';
import { IsolateTestPayload } from 'IsolateTest';
import { TestStatus } from 'IsolateTestStateMachine';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { Suite } from 'SuiteTypes';
import { VestIsolateType } from 'VestIsolateType';
import { IsolateFocusedPayload } from 'focused';

export class SuiteSerializer {
  static serialize(suite: Suite<TFieldName, TGroupName>) {
    const dump = { ...suite.dump(), output: undefined };

    return IsolateSerializer.serialize(dump, MiniMap);
  }

  static deserialize(
    serialized: string | TIsolateSuite | Record<string, any>
  ): TIsolateSuite {
    return IsolateSerializer.deserialize(serialized, MiniMap) as TIsolateSuite;
  }

  static resume(
    suite: Suite<TFieldName, TGroupName>,
    root: string | TIsolateSuite | Record<string, any>
  ): void {
    const suiteRoot = SuiteSerializer.deserialize(root);

    suite.resume(suiteRoot);
  }
}

const testMiniMap: Record<keyof IsolateTestPayload, string> = {
  asyncTest: '_at', // asyncTest is not serialized
  fieldName: 'fN',
  groupName: 'gN',
  message: 'ms',
  severity: 'sv',
  status: 'st',
  testFn: '_tf', // testFn is not serialized
};

const focusMiniMap: Record<keyof IsolateFocusedPayload, string> = {
  focusMode: 'fM',
  match: 'm',
  matchAll: 'mA',
};

const MiniMap: MiniMap = {
  keys: {
    data: assign({}, testMiniMap, focusMiniMap),
  },
  values: {
    status: {
      CANCELED: 'C',
      DONE: 'D',
      FAILED: 'F',
      INITIAL: 'I',
      OMITTED: 'O',
      PASSING: 'P',
      PENDING: 'PE',
      SKIPPED: 'S',
      UNTESTED: 'U',
      WARNING: 'W',
    },
    $type: {
      Each: 'E',
      Focused: 'F',
      Group: 'G',
      OmitWhen: 'OW',
      SkipWhen: 'SW',
      Suite: 'S',
      Test: 'T',
    },
  },
};

type MiniMap = {
  keys: {
    data: Record<keyof IsolateTestPayload, string> &
      Record<keyof IsolateFocusedPayload, string>;
  };
  values: {
    status: Record<keyof typeof TestStatus, string> &
      Record<keyof typeof CommonStates, string>;
    $type: Record<keyof typeof VestIsolateType, string>;
  };
};
