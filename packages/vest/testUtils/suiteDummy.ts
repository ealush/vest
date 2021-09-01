import asArray from '../../shared/src/asArray';

import { dummyTest } from './testDummy';

import { optional, create, skip } from 'vest';

export function failing(failingFields?: string | string[]) {
  return createSuiteResult(failingFields, fieldName => {
    dummyTest.failing(fieldName);
  });
}

export function warning(failingFields?: string | string[]) {
  return createSuiteResult(failingFields, fieldName => {
    dummyTest.failingWarning(fieldName);
  });
}

export function failingAsync(failingFields?: string | string[]) {
  return createSuiteResult(failingFields, fieldName => {
    dummyTest.failingAsync(fieldName);
  });
}

export function passing(fields?: string | string[]) {
  return createSuiteResult(fields, fieldName => {
    dummyTest.passing(fieldName);
  });
}

export function passingWithUntestedOptional(
  optionals: string | string[] = 'optional_field',
  required: string | string[] = 'field_1'
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
  optionals: string | string[] = 'optional_field',
  required: string | string[] = 'field_1'
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
  optionals: string | string[] = 'optional_field',
  required: string | string[] = 'field_1'
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

export function untested(fields?: string | string[]) {
  const suite = createSuite(fields, fieldName => {
    dummyTest.failing(fieldName);
  });
  return suite.get();
}

function createSuiteResult(
  fieldNames: string[] | string | undefined,
  callback: (fieldName?: string) => void
) {
  return createSuite(fieldNames, callback)();
}

function createSuite(
  fieldNames: string[] | string | undefined = 'field_1',
  callback: (fieldName?: string) => void
) {
  return create(() => {
    asArray(fieldNames).forEach(fieldName => callback(fieldName));
  });
}
