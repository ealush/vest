import { describe, expect, expectTypeOf, it, vi } from 'vitest';

import { create, enforce, test } from '../../vest';

/**
 * AP05: public API surface decisions. The deferred `signal` overload is
 * gone from the V1 types (runtime misuse still throws explicitly — see
 * changed.integration.test.ts); valid fluent chains keep input/output
 * inference; async test callbacks still receive a working AbortSignal.
 */
describe('schema contracts: public API surface', () => {
  it('[SC-PUBLIC-API] changed has no signal overload but valid chains keep inference', () => {
    const schema = enforce.shape({
      password: enforce.isString(),
      confirm: enforce.isString().dependsOn($ => $.password),
    });
    const suite = create((data: { password: string; confirm: string }) => {
      test('password', () => {
        enforce(data.password).isNotBlank();
      });
    }, schema);

    const controller = new AbortController();
    expect(() =>
      // @ts-expect-error — signal is not part of the V1 type surface
      suite.changed('password', { signal: controller.signal }),
    ).toThrowError(/deferred to v2/);

    const result = suite
      .changed('password')
      .only('password')
      .focus({ skip: 'confirm' })
      .run({ password: 'secret', confirm: 'secret' });
    expectTypeOf(result.isValid()).toBeBoolean();
    expect(result.hasErrors('confirm')).toBe(false);
  });

  it('[SC-PUBLIC-API] async test callbacks still receive an AbortSignal', async () => {
    const onSignal = vi.fn();
    const suite = create(() => {
      test('field', async ({ signal }) => {
        onSignal(signal);
      });
    });
    await suite.run();
    expect(onSignal).toHaveBeenCalledTimes(1);
    expect(onSignal.mock.calls[0]?.[0]).toBeInstanceOf(AbortSignal);
  });
});
