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
    expectTypeOf(current.value).toEqualTypeOf<{
      first: string;
      second: number;
    }>();
  const focused = suite.only('first').run({ first: 'a' });
  if (focused.valid) {
    expectTypeOf(focused.value).toEqualTypeOf<{
      first: string;
      second: number;
    }>();
    expectTypeOf(focused.types.output).toEqualTypeOf<{
      first: string;
      second: number;
    }>();
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

it('keeps complete types outside a selection that may be defined', () => {
  const schema = enforce.shape({
    age: enforce.isNumeric().toNumber(),
    active: enforce.isNumeric().toBoolean(),
  });
  const suite = create(() => test('active', () => true), schema);
  const input = { age: '42', active: '1' };
  type Complete = { age: number; active: boolean };
  const focused = suite.only('active').run(input);
  if (focused.valid) expectTypeOf(focused.value).toEqualTypeOf<Complete>();
  const changed = suite.changed('active').only('active').run(input);
  if (changed.valid)
    expectTypeOf(changed.value).toEqualTypeOf<Partial<Complete>>();
  const cleared = suite.changed('active').only('active').changed().run(input);
  if (cleared.valid) expectTypeOf(cleared.value).toEqualTypeOf<Complete>();
  const undefinedSelection = suite.changed(undefined).run(input);
  if (undefinedSelection.valid)
    expectTypeOf(undefinedSelection.value).toEqualTypeOf<Complete>();
  function dynamicSelection(fields: string | readonly string[] | undefined) {
    return suite.changed(fields).run(input);
  }
  const dynamic = dynamicSelection('active');
  if (dynamic.valid)
    expectTypeOf(dynamic.value).toEqualTypeOf<Partial<Complete>>();
});
