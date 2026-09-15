import { CB, DynamicValue } from 'vest-utils';
import { TIsolate, IsolateKey } from 'vestjs-runtime';

import { TIsolateTest } from '../core/isolate/IsolateTest/IsolateTest';
import { TestFn, TestMessage } from '../core/test/TestTypes';
import { test } from '../core/test/test';
import {
  FieldExclusion,
  FieldSelector,
  only,
  skip,
} from '../hooks/focused/focused';
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
  };
}

export type TTypedMethods<F extends TFieldName, G extends TGroupName> = {
  include: (fieldName: F) => {
    when: (condition: string | F | TDraftCondition<F, G>) => void;
  };

  omitWhen: (conditional: TDraftCondition<F, G>, callback: CB) => void;
  only: {
    (item: FieldExclusion<F> | FieldSelector<F>): void;
  };
  optional: (optionals: OptionalsInput<F>) => void;
  skip: {
    (item: FieldExclusion<F> | FieldSelector<F>): void;
  };
  skipWhen: (condition: TDraftCondition<F, G>, callback: CB) => void;
  test: {
    (
      fieldName: FieldSelector<F>,
      message: TestMessage,
      cb: TestFn,
    ): TIsolateTest;
    (fieldName: FieldSelector<F>, cb: TestFn): TIsolateTest;
    (
      fieldName: FieldSelector<F>,
      message: TestMessage,
      cb: TestFn,
      key: IsolateKey,
    ): TIsolateTest;
    (fieldName: FieldSelector<F>, cb: TestFn, key: IsolateKey): TIsolateTest;
  };
  group: {
    (callback: () => void): TIsolate;
    (groupName: G, callback: () => void): TIsolate;
  };
};

export type TDraftCondition<
  F extends TFieldName,
  G extends TGroupName,
> = DynamicValue<boolean, [draft: SuiteResult<F, G>]>;
