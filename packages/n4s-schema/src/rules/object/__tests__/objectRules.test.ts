import { describe, expect, it } from 'vitest';

import { enforce } from 'n4s-schema';

describe('objectRules', () => {
  it('checkKey: isKeyOf / isNotKeyOf', () => {
    const obj = { id: 1, name: 'Alice' };
    expect(enforce.isKeyOf(obj).run('id').pass).toBe(true);
    expect(enforce.isKeyOf(obj).run('age').pass).toBe(false);
    expect(enforce.isNotKeyOf(obj).run('age').pass).toBe(true);
    expect(enforce.isNotKeyOf(obj).run('name').pass).toBe(false);
  });

  it('checkValue: isValueOf / isNotValueOf', () => {
    const obj = { a: 10, b: 20, c: 30 };
    expect(enforce.isValueOf(obj).run(20).pass).toBe(true);
    expect(enforce.isValueOf(obj).run(40).pass).toBe(false);
    expect(enforce.isNotValueOf(obj).run(40).pass).toBe(true);
    expect(enforce.isNotValueOf(obj).run(10).pass).toBe(false);
  });
});
