import { expect, it } from 'vitest';

import { create, test } from '../../vest';

it('names the opt-in entry when changed() is run without it', () => {
  const suite = create(() => test('a', () => true));
  expect(() => suite.changed('a').run()).toThrow(
    "suite.changed() needs: import 'vest/relationships'",
  );
});
