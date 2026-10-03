import { expect, it } from 'vitest';

import { enforce } from '../n4s';

it('resolves declarations made before the opt-in entry is imported', async () => {
  const schema = enforce.shape({
    a: enforce.isString(),
    b: enforce.isString().dependsOn($ => $.a),
  });
  await import('../exports/relationships');
  expect(schema.describe().relationships).toEqual([
    { source: ['a'], target: ['b'], effect: 'invalidate' },
  ]);
});
