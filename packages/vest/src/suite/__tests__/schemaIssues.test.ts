import { expect, it } from 'vitest';

import { create, enforce, test } from '../../vest';

it('includes message-free schema failures in result.issues', () => {
  const suite = create(() => {}, enforce.shape({ name: enforce.isString() }));
  const result = suite.run({ name: 42 } as never);

  expect(result.valid).toBe(false);
  expect(result.issues).toEqual([
    { message: 'Validation failed', path: ['name'] },
  ]);
  expect(suite['~standard'].validate({ name: 42 })).toEqual({
    issues: [{ message: 'Validation failed', path: ['name'] }],
  });
});

it('includes message-free user-test failures in result.issues', () => {
  const result = create(() => test('name', () => false)).run();
  expect(result.issues).toEqual([
    { message: 'Validation failed', path: ['name'] },
  ]);
});

it('uses the same nested paths in SuiteResult and Standard Schema issues', () => {
  const suite = create(
    () => {},
    enforce.shape({
      rows: enforce.isArrayOf(enforce.shape({ name: enforce.isString() })),
    }),
  );
  const data = { rows: [{ name: 1 }] };
  const result = suite.run(data as never);
  expect(result.issues).toEqual([
    { message: 'Validation failed', path: ['rows', '0', 'name'] },
  ]);
  expect(suite['~standard'].validate(data)).toEqual({ issues: result.issues });
});

it('reports a failure of the whole input without a path', () => {
  const suite = create(() => {}, enforce.shape({ name: enforce.isString() }));
  const result = suite.run(null as never);
  expect(result.errors.map(error => error.fieldName)).toEqual(['__root__']);
  expect(result.issues).toEqual([
    { message: 'Validation failed', path: undefined },
  ]);
  expect(suite['~standard'].validate(null)).toEqual({ issues: result.issues });
});
