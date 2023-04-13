import { optional, skipWhen, omitWhen, IsolateTest } from 'vest';
import { CB } from 'vest-utils';

import { OptionalsInput } from 'OptionalTypes';
import { SuiteResult, TFieldName } from 'SuiteResultTypes';
import { TestFn } from 'TestTypes';
import { ExclusionItem, FieldExclusion, only, skip } from 'exclusive';
import { include } from 'include';
import { IsolateKey } from 'isolate';
import { test } from 'test';
import { TestMemo } from 'test.memo';

export function getTypedMethods<F extends TFieldName>(): TTypedMethods<F> {
  return {
    include,
    omitWhen,
    only,
    optional,
    skip,
    skipWhen,
    test,
  };
}

export type TTypedMethods<F extends TFieldName> = {
  include: (fieldName: F) => {
    when: (
      condition: boolean | F | ((draft: SuiteResult<F>) => boolean)
    ) => void;
  };
  omitWhen: (
    conditional: boolean | ((draft: SuiteResult<F>) => boolean),
    callback: CB
  ) => void;
  only: {
    (item: FieldExclusion<F>): void;
    group(item: ExclusionItem): void;
  };
  optional: (optionals: OptionalsInput<F>) => void;
  skip: {
    (item: FieldExclusion<F>): void;
    group(item: ExclusionItem): void;
  };
  skipWhen: (
    condition: boolean | ((draft: SuiteResult<F>) => boolean),
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
};
