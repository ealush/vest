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
