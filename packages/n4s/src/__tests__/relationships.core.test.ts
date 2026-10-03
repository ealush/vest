import { expect, it } from 'vitest';

import { enforce } from '../n4s';

it('stores declarations without evaluating them or changing validation', () => {
  let calls = 0;
  const schema = enforce.shape({
    a: enforce.isString(),
    b: enforce.isString().dependsOn($ => {
      calls++;
      return $.a;
    }),
  });
  expect(schema.test({ a: 'a', b: 'b' })).toBe(true);
  expect(calls).toBe(0);
  expect(() => schema.describe()).toThrow("import 'n4s/relationships'");
});
