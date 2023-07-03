// import { optional, skipWhen, omitWhen, IsolateTest, group } from 'vest';
import { optional } from 'optional';
import { CB, DynamicValue } from 'vest-utils';
import { Isolate, IsolateKey } from 'vestjs-runtime';

import { IsolateTest } from 'IsolateTest';
import { OptionalsInput } from 'OptionalTypes';
import { SuiteResult, TFieldName, TGroupName } from 'SuiteResultTypes';
import { TestFn } from 'TestTypes';
import { FieldExclusion, GroupExclusion, only, skip } from 'focused';
import { group } from 'group';
import { include } from 'include';
import { omitWhen } from 'omitWhen';
import { skipWhen } from 'skipWhen';
import { test } from 'test';
import { TestMemo } from 'test.memo';

export function getTypedMethods<
  F extends TFieldName,
  G extends TGroupName
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
    when: (condition: F | TDraftCondition<F, G>) => void;
  };
  omitWhen: (conditional: TDraftCondition<F, G>, callback: CB) => void;
  only: {
    (item: FieldExclusion<F>): void;
    group(item: GroupExclusion<G>): void;
  };
  optional: (optionals: OptionalsInput<F>) => void;
  skip: {
    (item: FieldExclusion<F>): void;
    group(item: GroupExclusion<G>): void;
  };
  skipWhen: (condition: TDraftCondition<F, G>, callback: CB) => void;
  test: {
    (fieldName: F, message: string, cb: TestFn): IsolateTest;
    (fieldName: F, cb: TestFn): IsolateTest;
    (fieldName: F, message: string, cb: TestFn, key: IsolateKey): IsolateTest;
    (fieldName: F, cb: TestFn, key: IsolateKey): IsolateTest;
  } & {
    memo: TestMemo<F>;
  };
  group: (groupName: G, callback: () => void) => Isolate;
};

export type TDraftCondition<
  F extends TFieldName,
  G extends TGroupName
> = DynamicValue<boolean, [draft: SuiteResult<F, G>]>;
