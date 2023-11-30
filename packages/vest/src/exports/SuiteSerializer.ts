import { assign } from 'vest-utils';
import { IsolateSerializer } from 'vestjs-runtime';

import { TIsolateSuite } from 'IsolateSuite';
import { IsolateTestPayload } from 'IsolateTest';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { Suite } from 'SuiteTypes';
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
  message: 'msg',
  severity: 'sv',
  status: 'st',
  testFn: '_tf', // testFn is not serialized
};

const focusMiniMap: Record<keyof IsolateFocusedPayload, string> = {
  focusMode: 'fM',
  match: 'm',
  matchAll: 'mA',
};

const MiniMap = {
  keys: {
    data: assign({}, testMiniMap, focusMiniMap),
  },
};
