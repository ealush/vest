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
  }
});
