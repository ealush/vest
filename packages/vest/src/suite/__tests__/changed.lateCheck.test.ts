import { expect, it } from 'vitest';

import { create, enforce } from '../../vest';

it('reports unknown references of a suite created before the entry on its first changed run', async () => {
  const schema = enforce.shape({
    // @ts-expect-error the shape also reports this at compile time
    a: enforce.isString().dependsOn($ => $('missing')),
  });
  const suite = create(() => {}, schema);
  await import('../../exports/relationships');
  expect(() => suite.changed('a').run({ a: 'x' })).toThrow(
    /depends on unknown field "missing"/,
  );
});
