import { CB } from 'vest-utils';
import { IsolateSerializer } from 'vestjs-runtime';

import { TIsolateSuite } from 'IsolateSuite';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { Suite } from 'SuiteTypes';

export type Dumpable = {
  dump: CB<TIsolateSuite>;
};

export class SuiteSerializer {
  static serialize(suite: Dumpable) {
    const dump = { ...suite.dump(), output: undefined };

    return IsolateSerializer.serialize(dump);
  }

  static deserialize(
    serialized: string | TIsolateSuite | Record<string, any>,
  ): TIsolateSuite {
    return IsolateSerializer.deserialize(serialized) as TIsolateSuite;
  }

  static resume(
    suite: Suite<TFieldName, TGroupName>,
    root: string | TIsolateSuite | Record<string, any>,
  ): void {
    const suiteRoot = SuiteSerializer.deserialize(root);

    suite.resume(suiteRoot);
  }
}
