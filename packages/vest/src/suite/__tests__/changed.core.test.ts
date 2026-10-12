import { expect, it } from 'vitest';

import { create, enforce, test } from '../../vest';

it('names the opt-in entry when changed() is run without it', () => {
  const suite = create(() => test('a', () => true));
  expect(() => suite.changed('a').run()).toThrow(
    "suite.changed() needs: import 'vest/relationships'",
  );
});

it('does not resolve relationships at create() without the opt-in entry', () => {
  const schema = enforce.shape({
    // @ts-expect-error the shape also reports this at compile time
    a: enforce.isString().dependsOn($ => $('missing')),
  });
  expect(() => create(() => {}, schema)).not.toThrow();
});
