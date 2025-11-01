import { describe, it, expect } from 'vitest';

import { enforceLazy } from '../../../lazy';

describe('isNullish', () => {
  it('passes for null', () => {
    expect(enforceLazy.isNullish().run(null).passes).toBe(true);
  });

  it('passes for undefined', () => {
    expect(enforceLazy.isNullish().run(undefined).passes).toBe(true);

    let uninitialized: null | undefined | number;
    // @ts-expect-error - uninitialized may be number | null | undefined
    expect(enforceLazy.isNullish().run(uninitialized).passes).toBe(true);
  });

  it('fails for falsy non-nullish primitives', () => {
    const zero: null | undefined | number = 0;
    const emptyString: null | undefined | string = '';
    const falseBool: null | undefined | boolean = false;
    const nanValue: null | undefined | number = NaN;

    // @ts-expect-error - testing that non-nullish values are rejected
    expect(enforceLazy.isNullish().run(zero).passes).toBe(false);
    // @ts-expect-error - testing that non-nullish values are rejected
    expect(enforceLazy.isNullish().run(emptyString).passes).toBe(false);
    // @ts-expect-error - testing that non-nullish values are rejected
    expect(enforceLazy.isNullish().run(falseBool).passes).toBe(false);
    // @ts-expect-error - testing that non-nullish values are rejected
    expect(enforceLazy.isNullish().run(nanValue).passes).toBe(false);
  });

  it('fails for truthy values', () => {
    const num: null | undefined | number = 42;
    const str: null | undefined | string = 'hello';
    const bool: null | undefined | boolean = true;
    const obj: null | undefined | object = {};
    const arr: null | undefined | any[] = [];

    // @ts-expect-error - testing that non-nullish values are rejected
    expect(enforceLazy.isNullish().run(num).passes).toBe(false);
    // @ts-expect-error - testing that non-nullish values are rejected
    expect(enforceLazy.isNullish().run(str).passes).toBe(false);
    // @ts-expect-error - testing that non-nullish values are rejected
    expect(enforceLazy.isNullish().run(bool).passes).toBe(false);
    // @ts-expect-error - testing that non-nullish values are rejected
    expect(enforceLazy.isNullish().run(obj).passes).toBe(false);
    // @ts-expect-error - testing that non-nullish values are rejected
    expect(enforceLazy.isNullish().run(arr).passes).toBe(false);
  });
});
