import { expect, it } from 'vitest';

import { create, enforce } from '../../vest';

it('treats a passing schema-only suite as valid and exposes its parsed value', () => {
  const schema = enforce.shape({ age: enforce.isNumeric().toNumber() });
  const result = create(() => {}, schema).run({ age: '42' });

  expect(result.valid).toBe(true);
  expect(result.isValid()).toBe(true);
  expect(result.value).toEqual({ age: 42 });
  expect(result.testCount).toBe(0);
});

it('keeps a failing schema-only suite invalid', () => {
  const schema = enforce.shape({ age: enforce.isNumber() });
  const result = create(() => {}, schema).run({ age: 'no' } as never);

  expect(result.valid).toBe(false);
  expect(result.isValid()).toBe(false);
});

it('keeps an empty suite without a schema invalid', () => {
  const result = create(() => {}).run();
  expect(result.valid).toBe(false);
});
