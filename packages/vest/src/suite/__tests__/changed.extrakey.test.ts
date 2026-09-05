import { describe, expect, it } from 'vitest';
import { enforce } from 'n4s';

import { create, test } from '../../vest';

const topSchema = enforce.shape({
  profile: enforce.shape({
    state: enforce.isString(),
  }),
});

const nestedSchema = enforce.shape({
  profile: enforce.shape({
    state: enforce.shape({
      city: enforce.isString(),
    }),
    country: enforce.isString(),
  }),
});

// `nickname` is unknown at the profile level; `state.city` narrows the
// known sibling so the fragment actually rebuilds (a no-op narrowing
// would retain the whole rule and mask the bug).
const nestedData = {
  profile: { state: { city: 'ok' }, country: 'US', nickname: 'extra' },
};
const nestedAffected = ['profile.state.city', 'profile.nickname'];
const topData = { profile: { state: 'ok' }, email: 'extra' };

describe('changed() strict-shape extra-key parity', () => {
  it('top-level extra key fails the changed run like the full run', async () => {
    // 'email' is out of schema, so the typed hasErrors() selector cannot
    // name it — the untyped getErrors() map pins the failure instead.
    const suite = create(data => {
      test('profile.state', () => {
        enforce(data.profile.state).isString();
      });
    }, topSchema);

    const full = await suite.run(topData);
    expect(full.getErrors()).toHaveProperty('email');

    const changed = await suite
      .changed(['profile.state', 'email'])
      .run(topData);
    expect(changed.getErrors()).toHaveProperty('email');
  });

  it('nested extra key fails the changed run like the full run', async () => {
    const suite = create(data => {
      test('profile.state.city', () => {
        enforce(data.profile.state.city).isString();
      });
    }, nestedSchema);

    const full = await suite.run(nestedData);
    expect(full.hasErrors('profile.nickname')).toBe(true);

    const changed = await suite.changed(nestedAffected).run(nestedData);
    expect(changed.hasErrors('profile.nickname')).toBe(true);
  });

  it('absent top-level key passes the changed run', async () => {
    const suite = create(data => {
      test('profile.state', () => {
        enforce(data.profile.state).isString();
      });
    }, topSchema);

    const data = { profile: { state: 'ok' } };
    const full = await suite.run(data);
    expect(full.hasErrors()).toBe(false);

    const changed = await suite.changed(['profile.state', 'email']).run(data);
    expect(changed.hasErrors()).toBe(false);
  });

  it('absent nested key passes the changed run', async () => {
    const suite = create(data => {
      test('profile.state.city', () => {
        enforce(data.profile.state.city).isString();
      });
    }, nestedSchema);

    const data = { profile: { state: { city: 'ok' }, country: 'US' } };
    const full = await suite.run(data);
    expect(full.hasErrors()).toBe(false);

    const changed = await suite.changed(nestedAffected).run(data);
    expect(changed.hasErrors()).toBe(false);
  });
});
