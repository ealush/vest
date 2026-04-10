import { CB, DynamicValue } from 'vest-utils';
import { TIsolate, IsolateKey } from 'vestjs-runtime';

import { TIsolateTest } from '../core/isolate/IsolateTest/IsolateTest';
import { TestReturnValue } from '../core/test/TestReturnValue';
import { TestFn, TestMessage } from '../core/test/TestTypes';
import { test } from '../core/test/test';
import { FieldExclusion, only, skip } from '../hooks/focused/focused';
import { include } from '../hooks/include';
import { OptionalsInput } from '../hooks/optional/OptionalTypes';
import { optional } from '../hooks/optional/optional';
import { group } from '../isolates/group';
import { omitWhen } from '../isolates/omitWhen';
import { skipWhen } from '../isolates/skipWhen';
import {
  SuiteResult,
  TFieldName,
  TGroupName,
} from '../suiteResult/SuiteResultTypes';

export function getTypedMethods<
  F extends TFieldName,
  G extends TGroupName,
>(): TTypedMethods<F, G> {
  return {
    group,
    include,
    omitWhen,
    only,
    optional,
    skip,
    skipWhen,
    test,
  } as TTypedMethods<F, G>;
}

export type TTypedMethods<F extends TFieldName, G extends TGroupName> = {
  include: (fieldName: F) => {
    when: (condition: F | TDraftCondition<F, G>) => void;
  };

  omitWhen: (conditional: TDraftCondition<F, G>, callback: CB) => void;
  only: {
    (item: FieldExclusion<F>): void;
  };
  optional: (optionals: OptionalsInput<F>) => void;
  skip: {
    (item: FieldExclusion<F>): void;
  };
  skipWhen: (condition: TDraftCondition<F, G>, callback: CB) => void;
  test: {
    (fieldName: F, message: TestMessage, cb: TestFn): TestReturnValue<F>;
    (fieldName: F, cb: TestFn): TestReturnValue<F>;
    (
      fieldName: F,
      message: TestMessage,
      cb: TestFn,
      key: IsolateKey,
    ): TestReturnValue<F>;
    (fieldName: F, cb: TestFn, key: IsolateKey): TestReturnValue<F>;
  };
  group: {
    (callback: () => void): TIsolate;
    (groupName: G, callback: () => void): TIsolate;
  };
};

export type TDraftCondition<
  F extends TFieldName,
  G extends TGroupName,
> = DynamicValue<boolean, [draft: SuiteResult<F, G>, currentNode: TIsolateTest]>;
