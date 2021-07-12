import enforce from 'n4s';

import { isBoolean, isNotBoolean } from 'isBoolean';

describe('isBoolean', () => {
  it('Should pass for a boolean value', () => {
    expect(isBoolean(true)).toBe(true);
    expect(isBoolean(false)).toBe(true);
    expect(isBoolean(Boolean(1))).toBe(true);
    enforce(true).isBoolean();
    enforce(false).isBoolean();
  });

  it('Should fail for a non boolean value', () => {
    expect(isBoolean('true')).toBe(false);
    expect(isBoolean([false])).toBe(false);
    expect(isBoolean(null)).toBe(false);
    expect(() => enforce('true').isBoolean()).toThrow();
  });
});

describe('isNotBoolean', () => {
  it('Should pass for a non boolean value', () => {
    expect(isNotBoolean('true')).toBe(true);
    expect(isNotBoolean([false])).toBe(true);
    expect(isNotBoolean(null)).toBe(true);
    enforce('true').isNotBoolean();
    enforce([false]).isNotBoolean();
  });

  it('Should fail for a boolean value', () => {
    expect(isNotBoolean(true)).toBe(false);
    expect(isNotBoolean(false)).toBe(false);
    expect(isNotBoolean(Boolean(1))).toBe(false);
    expect(() => enforce(true).isNotBoolean()).toThrow();
  });
});
