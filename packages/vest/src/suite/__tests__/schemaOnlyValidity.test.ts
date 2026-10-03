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

it('does not treat a focused schema-only run as valid', () => {
  const schema = enforce.shape({
    a: enforce.isString(),
    b: enforce.isString(),
  });
  const result = create(() => {}, schema)
    .only('a')
    .run({ a: 'ok', b: 1 } as never);

  expect(result.valid).toBe(false);
  expect(result.isValid()).toBe(false);
});

it('recomputes schema-only validity after a failed or focused run', () => {
  const suite = create(
    () => {},
    enforce.shape({ a: enforce.isString(), b: enforce.isString() }),
  );
  expect(suite.run({ a: 1, b: 'x' } as never).valid).toBe(false);
  expect(suite.only('a').run({ a: 'x', b: 'x' }).valid).toBe(false);
  expect(suite.run({ a: 'x', b: 'x' }).valid).toBe(true);
});
