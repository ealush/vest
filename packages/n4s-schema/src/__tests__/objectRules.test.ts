import { describe, expect, it } from 'vitest';

import { enforceLazy } from 'lazy';

describe('objectRules', () => {
  it('checkKey: isKeyOf / isNotKeyOf', () => {
    const obj = { id: 1, name: 'Alice' };
    expect(enforceLazy.checkKey().isKeyOf(obj).run('id').pass).toBe(true);
    expect(enforceLazy.checkKey().isKeyOf(obj).run('age').pass).toBe(false);
    expect(enforceLazy.checkKey().isNotKeyOf(obj).run('age').pass).toBe(true);
    expect(enforceLazy.checkKey().isNotKeyOf(obj).run('name').pass).toBe(false);
  });

  it('checkValue: isValueOf / isNotValueOf', () => {
    const obj = { a: 10, b: 20, c: 30 };
    expect(enforceLazy.checkValue<number>().isValueOf(obj).run(20).pass).toBe(
      true,
    );
    expect(enforceLazy.checkValue<number>().isValueOf(obj).run(40).pass).toBe(
      false,
    );
    expect(
      enforceLazy.checkValue<number>().isNotValueOf(obj).run(40).pass,
    ).toBe(true);
    expect(
      enforceLazy.checkValue<number>().isNotValueOf(obj).run(10).pass,
    ).toBe(false);
  });
});
