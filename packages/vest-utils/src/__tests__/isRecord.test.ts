import { describe, expect, it } from 'vitest';

import { isRecord } from '../isRecord';

describe('isRecord', () => {
  it.each([
    [{}, true],
    [Object.create(null), true],
    [new Date(), true],
    [[], false],
    [null, false],
    [undefined, false],
    ['value', false],
    [() => undefined, false],
  ])('returns %s for %o', (value, expected) => {
    expect(isRecord(value)).toBe(expected);
  });
});
