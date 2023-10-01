import { OneOrMoreOf, asArray, Maybe } from 'vest-utils';

import { dummyTest } from './testDummy';

import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { optional, create, skip, SuiteResult } from 'vest';

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
  required: OneOrMoreOf<string> = 'field_1'
) {
  return create(() => {
    optional(optionals);
    skip(optionals);

    asArray(optionals).forEach(fieldName => {
      dummyTest.failing(fieldName);
    });

    asArray(required).forEach(fieldName => {
      dummyTest.passing(fieldName);
    });
  })();
}

export function passingWithOptional(
  optionals: OneOrMoreOf<string> = 'optional_field',
  required: OneOrMoreOf<string> = 'field_1'
) {
  return create(() => {
    optional(optionals);

    asArray(optionals).forEach(fieldName => {
      dummyTest.passing(fieldName);
    });

    asArray(required).forEach(fieldName => {
      dummyTest.passing(fieldName);
    });
  })();
}

export function failingOptional(
  optionals: OneOrMoreOf<string> = 'optional_field',
  required: OneOrMoreOf<string> = 'field_1'
) {
  return create(() => {
    optional(optionals);

    asArray(optionals).forEach(fieldName => {
      dummyTest.failing(fieldName);
    });

    asArray(required).forEach(fieldName => {
      dummyTest.passing(fieldName);
    });
  })();
}

export function untested(fields?: OneOrMoreOf<string>) {
  const suite = createSuite(fields, fieldName => {
    dummyTest.failing(fieldName);
  });
  return suite.get();
}

function createSuiteRunResult(
  fieldNames: Maybe<string[] | string>,
  callback: (_fieldName?: string) => void
) {
  return createSuite(fieldNames, callback)();
}

function createSuite(
  fieldNames: Maybe<string[] | string> = 'field_1',
  callback: (_fieldName?: string) => void
) {
  return create(() => {
    asArray(fieldNames).forEach(fieldName => callback(fieldName));
  });
}

export function ser<F extends TFieldName, G extends TGroupName>(
  res: SuiteResult<F, G>
) {
  return JSON.parse(JSON.stringify(res));
}
