import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s-schema';

describe('isNullish', () => {
  it('pass for null', () => {
    expect(enforce.isNullish().run(null).pass).toBe(true);
  });

  it('pass for undefined', () => {
    expect(enforce.isNullish().run(undefined).pass).toBe(true);

    let uninitialized: null | undefined | number;
    // Type test: - uninitialized may be number | null | undefined
    expect(enforce.isNullish().run(uninitialized).pass).toBe(true);
  });

  it('fails for falsy non-nullish primitives', () => {
    const zero: null | undefined | number = 0;
    const emptyString: null | undefined | string = '';
    const falseBool: null | undefined | boolean = false;
    const nanValue: null | undefined | number = NaN;

    // Type test: - testing that non-nullish values are rejected
    expect(enforce.isNullish().run(zero).pass).toBe(false);
    // Type test: - testing that non-nullish values are rejected
    expect(enforce.isNullish().run(emptyString).pass).toBe(false);
    // Type test: - testing that non-nullish values are rejected
    expect(enforce.isNullish().run(falseBool).pass).toBe(false);
    // Type test: - testing that non-nullish values are rejected
    expect(enforce.isNullish().run(nanValue).pass).toBe(false);
  });

  it('fails for truthy values', () => {
    const num: null | undefined | number = 42;
    const str: null | undefined | string = 'hello';
    const bool: null | undefined | boolean = true;
    const obj: null | undefined | object = {};
    const arr: null | undefined | any[] = [];

    // Type test: - testing that non-nullish values are rejected
    expect(enforce.isNullish().run(num).pass).toBe(false);
    // Type test: - testing that non-nullish values are rejected
    expect(enforce.isNullish().run(str).pass).toBe(false);
    // Type test: - testing that non-nullish values are rejected
    expect(enforce.isNullish().run(bool).pass).toBe(false);
    // Type test: - testing that non-nullish values are rejected
    expect(enforce.isNullish().run(obj).pass).toBe(false);
    // Type test: - testing that non-nullish values are rejected
    expect(enforce.isNullish().run(arr).pass).toBe(false);
  });
});
