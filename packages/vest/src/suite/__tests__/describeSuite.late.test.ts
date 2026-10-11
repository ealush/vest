import { expect, it } from 'vitest';

import { create, test } from '../../vest';

it('needs suites created after the relationships entry', async () => {
  const suite = create(() => test('a', () => true));
  const { describeSuite } = await import('../../exports/relationships');
  expect(() => describeSuite(suite)).toThrow(
    "describeSuite() needs a suite created after: import 'vest/relationships'",
  );
  expect(describeSuite(create(() => {})).tests).toEqual([]);
});
