import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s';

import { create } from '../../../vest';

describe('selectors with nested field paths', () => {
  const schema = enforce.shape({
    profile: enforce.shape({
      country: enforce.isString(),
      state: enforce.isString(),
    }),
  });

  it('reports failures under nested dotted paths', () => {
    const suite = create(() => {}, schema);
    const result = suite.run({
      profile: {
        country: 'US',
        // @ts-expect-error - invalid data probe: state must be a string
        state: 42,
      },
    });

    expect(result.hasErrors()).toBe(true);
    expect(result.hasErrors('profile.state')).toBe(true);
    expect(result.hasErrors('profile.country')).toBe(false);
  });

  it('unknown dotted paths typecheck but never match (documented)', () => {
    // InputFieldName<F> deliberately accepts `${F}.${string}` so nested
    // schema paths are queryable. The tradeoff: a dotted typo also compiles
    // and, because runtime matching is exact, quietly reports no errors.
    const suite = create(() => {}, schema);
    const result = suite.run({
      profile: {
        country: 'US',
        // @ts-expect-error - invalid data probe: state must be a string
        state: 42,
      },
    });

    expect(result.hasErrors('profile.state')).toBe(true);
    expect(result.hasErrors('profile.typo')).toBe(false);
  });
});
