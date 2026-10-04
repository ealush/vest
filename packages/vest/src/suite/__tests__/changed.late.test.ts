import { expect, it } from 'vitest';

import { create, enforce, test } from '../../vest';

it('activates relationships after the schema and suite were created', async () => {
  const schema = enforce.shape({
    source: enforce.isString(),
    dependent: enforce.isString().dependsOn($ => $.source),
  });
  const suite = create(() => test('source', () => true), schema);
  await import('../../exports/relationships');

  expect(schema.describe().relationships).toHaveLength(1);
  expect(
    suite
      .changed('source')
      .run({ source: 'ok', dependent: 1 } as never)
      .hasErrors('dependent'),
  ).toBe(true);
});
