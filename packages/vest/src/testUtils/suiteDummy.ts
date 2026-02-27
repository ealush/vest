/**
 * Module: `src/testUtils/suiteDummy.ts`.
 *
 * Provides `suiteDummy`-related runtime and type utilities used by `vest`.
 */
import { OneOrMoreOf, asArray, Maybe } from 'vest-utils';

import { TFieldName, TGroupName } from '../suiteResult/SuiteResultTypes';
import { optional, create, skip, SuiteResult } from '../vest';

import { dummyTest } from './testDummy';

export function failing(failingFields?: OneOrMoreOf<string>) {
  return createSuiteRunResult(failingFields, fieldName => {
    dummyTest.failing(fieldName);
  });
}

export function warning(failingFields?: OneOrMoreOf<string>) {
  return createSuiteRunResult(failingFields, fieldName => {
    dummyTest.failingWarning(fieldName);
  });
}

export function failingAsync(failingFields?: OneOrMoreOf<string>) {
  return createSuiteRunResult(failingFields, fieldName => {
    dummyTest.failingAsync(fieldName);
  });
}

export function passing(fields?: OneOrMoreOf<string>) {
  return createSuiteRunResult(fields, fieldName => {
    dummyTest.passing(fieldName);
  });
}

export function passingWithUntestedOptional(
  optionals: OneOrMoreOf<string> = 'optional_field',
  required: OneOrMoreOf<string> = 'field_1',
) {
  return create(() => {
    optional(optionals as any);
    skip(optionals as TFieldName);

    asArray(optionals).forEach(fieldName => {
      dummyTest.failing(fieldName);
    });

    asArray(required).forEach(fieldName => {
      dummyTest.passing(fieldName);
    });
  }).run();
}

export function passingWithOptional(
  optionals: OneOrMoreOf<string> = 'optional_field',
  required: OneOrMoreOf<string> = 'field_1',
) {
  return create(() => {
    optional(optionals as any);

    asArray(optionals).forEach(fieldName => {
      dummyTest.passing(fieldName);
    });

    asArray(required).forEach(fieldName => {
      dummyTest.passing(fieldName);
    });
  }).run();
}

export function failingOptional(
  optionals: OneOrMoreOf<string> = 'optional_field',
  required: OneOrMoreOf<string> = 'field_1',
) {
  return create(() => {
    optional(optionals as any);

    asArray(optionals).forEach(fieldName => {
      dummyTest.failing(fieldName);
    });

    asArray(required).forEach(fieldName => {
      dummyTest.passing(fieldName);
    });
  }).run();
}

export function untested(fields?: OneOrMoreOf<string>) {
  const suite = createSuite(fields, fieldName => {
    dummyTest.failing(fieldName);
  });
  return suite.get();
}

function createSuiteRunResult(
  fieldNames: Maybe<string[] | string>,
  callback: (_fieldName?: string) => void,
) {
  return createSuite(fieldNames, callback).run();
}

function createSuite(
  fieldNames: Maybe<string[] | string> = 'field_1',
  callback: (_fieldName?: string) => void,
) {
  return create(() => {
    asArray(fieldNames).forEach(fieldName => callback(fieldName));
  });
}

export function ser<F extends TFieldName, G extends TGroupName>(
  res: SuiteResult<F, G>,
) {
  return JSON.parse(JSON.stringify(res));
}
