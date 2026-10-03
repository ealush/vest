import { expectTypeOf, it } from 'vitest';

import '../../exports/relationships';
import { create, enforce, test } from '../../vest';

it('types changed input and passing value as partial schema data', () => {
  const schema = enforce.shape({
    first: enforce.isString(),
    second: enforce.isNumber(),
  });
  const suite = create(() => test('first', () => true), schema);
  const result = suite.changed('first').run({ first: 'a' });
  if (result.valid) {
    expectTypeOf(result.value).toEqualTypeOf<
      Partial<{ first: string; second: number }>
    >();
    expectTypeOf(result.types.output).toEqualTypeOf<
      Partial<{ first: string; second: number }>
    >();
  }
  const current = suite.get();
  if (current.valid)
    expectTypeOf(current.value).toEqualTypeOf<
      Partial<{ first: string; second: number }>
    >();
  const focused = suite.only('first').run({ first: 'a' });
  if (focused.valid) {
    expectTypeOf(focused.value).toEqualTypeOf<
      Partial<{ first: string; second: number }>
    >();
    expectTypeOf(focused.types.output).toEqualTypeOf<
      Partial<{ first: string; second: number }>
    >();
  }
});

it('includes the empty output state for array and primitive schemas', () => {
  const array = create(
    () => test('a', () => true),
    enforce.isArrayOf(enforce.isString()),
  );
  const scalar = create(() => test('a', () => true), enforce.isNumber());
  array.run(['x']);
  scalar.run(1);
  const arrayResult = array.changed([]).run(['x']);
  const scalarResult = scalar.changed([]).run(1);
  if (arrayResult.valid)
    expectTypeOf(arrayResult.value).toEqualTypeOf<
      Array<string | undefined> | Record<never, never>
    >();
  if (scalarResult.valid)
    expectTypeOf(scalarResult.value).toEqualTypeOf<
      number | Record<never, never>
    >();
});
