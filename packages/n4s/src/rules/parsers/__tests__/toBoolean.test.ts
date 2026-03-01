import { describe, expect, it } from 'vitest';

import { toBoolean } from '../toBoolean';

describe('toBoolean parser', () => {
  it('parses boolean input', () => {
    expect(toBoolean(true).type).toBe(true);
    expect(toBoolean(false).type).toBe(false);
  });

  it('parses string input', () => {
    expect(toBoolean('true').type).toBe(true);
    expect(toBoolean('YES').type).toBe(true);
    expect(toBoolean('0').type).toBe(false);
    expect(toBoolean('off').type).toBe(false);
  });

  it('parses numeric input', () => {
    expect(toBoolean(1).type).toBe(true);
    expect(toBoolean(0).type).toBe(false);
  });

  it('fails for unsupported input', () => {
    expect(toBoolean('unknown')).toEqual({
      pass: false,
      type: false,
      message: 'Could not parse to boolean',
      path: undefined,
    });
  });
});
