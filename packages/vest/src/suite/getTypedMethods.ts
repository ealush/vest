import { optional, skipWhen, omitWhen, IsolateTest, group } from 'vest';
import { CB } from 'vest-utils';

import { Isolate, IsolateKey } from 'Isolate';
import { OptionalsInput } from 'OptionalTypes';
import { SuiteResult, TFieldName, TGroupName } from 'SuiteResultTypes';
import { TestFn } from 'TestTypes';
import { FieldExclusion, GroupExclusion, only, skip } from 'exclusive';
import { include } from 'include';
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
    when: (
      condition: boolean | F | ((draft: SuiteResult<F, G>) => boolean)
    ) => void;
  };
  omitWhen: (
    conditional: boolean | ((draft: SuiteResult<F, G>) => boolean),
    callback: CB
  ) => void;
  only: {
    (item: FieldExclusion<F>): void;
    group(item: GroupExclusion<G>): void;
  };
  optional: (optionals: OptionalsInput<F>) => void;
  skip: {
    (item: FieldExclusion<F>): void;
    group(item: GroupExclusion<G>): void;
  };
  skipWhen: (
    condition: boolean | ((draft: SuiteResult<F, G>) => boolean),
    callback: CB
  ) => void;
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
