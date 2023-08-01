import { IsolateSerializer } from 'vestjs-runtime';

import { TIsolateSuite } from 'IsolateSuite';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { Suite } from 'SuiteTypes';

export class SuiteSerializer {
  static serialize(suite: Suite<TFieldName, TGroupName>) {
    return IsolateSerializer.serialize(suite.dump());
  }

  static deserialize(
    serialized: string | TIsolateSuite | Record<string, any>
  ): TIsolateSuite {
    return IsolateSerializer.deserialize(serialized) as TIsolateSuite;
  }

  static resume(
    suite: Suite<TFieldName, TGroupName>,
    root: string | TIsolateSuite | Record<string, any>
  ): void {
    const suiteRoot = SuiteSerializer.deserialize(root);

    suite.resume(suiteRoot);
  }
}
