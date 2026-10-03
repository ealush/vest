import { describe, expect, it } from 'vitest';

import { enforce } from '../n4s';

describe('enforce.extend rule validation', () => {
  it('throws at registration when a rule is not a function', () => {
    expect(() =>
      enforce.extend({
        isNotAFunction: 5 as unknown as () => boolean,
      }),
    ).toThrow(
      'enforce.extend: rule "isNotAFunction" must be a function, received number',
    );
  });

  it('registers nothing when any rule in the batch is invalid', () => {
    expect(() =>
      enforce.extend({
        extendValidationGood: (value: unknown) => value === 'ok',
        extendValidationBad: null as unknown as () => boolean,
      }),
    ).toThrow('"extendValidationBad"');

    const lazy = enforce as unknown as Record<string, unknown>;
    expect(lazy.extendValidationGood).toBeUndefined();
    expect(() =>
      (
        enforce('ok') as unknown as Record<string, () => void>
      ).extendValidationGood(),
    ).toThrow();
  });

  it('still registers valid rules', () => {
    enforce.extend({
      extendValidationIsOk: (value: unknown) => value === 'ok',
    });
    const lazy = enforce as unknown as Record<
      string,
      () => { test: (value: unknown) => boolean }
    >;
    expect(lazy.extendValidationIsOk().test('ok')).toBe(true);
    expect(lazy.extendValidationIsOk().test('no')).toBe(false);
  });
});
