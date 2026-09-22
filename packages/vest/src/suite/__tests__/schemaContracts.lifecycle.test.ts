import { describe, expect, it } from 'vitest';

import { create, enforce, mode, Modes, test } from '../../vest';

describe('supported removal and keyed reinsertion', () => {
  it('removal of absent fields and repeated removal are safe', () => {
    const suite = create(() => {
      mode(Modes.ALL);
      test('a', () => {});
    }) as any;
    suite.run({});
    expect(() => suite.remove('absent')).not.toThrow();
    expect(() => suite.remove('a')).not.toThrow();
    expect(() => suite.remove('a')).not.toThrow();
    expect(suite.get().hasErrors('a')).toBe(false);
    expect(suite.run({}).hasErrors()).toBe(false);
  });

  it('keyed reinsertion of the same stable key recovers', () => {
    let active = ['a', 'c', 'd'];
    const suite = create((data: any) => {
      mode(Modes.ALL);
      for (const field of active) {
        test(
          field,
          () => {
            enforce(data[field]).isTruthy();
          },
          field,
        );
      }
    }, undefined as never) as any;
    suite.run({ a: true, c: false, d: true });
    expect(suite.get().hasErrors('c')).toBe(true);
    active = ['c', 'd'];
    suite.remove('a');
    const focused = suite.changed('d').run({ c: true, d: true });
    expect(focused.hasErrors('c')).toBe(true);
    active = ['a', 'c', 'd'];
    expect(suite.run({ a: true, c: true, d: true }).hasErrors()).toBe(false);
  });

  it('two suites sharing a schema stay isolated across removal', () => {
    const schema = enforce.shape({ a: enforce.isString() });
    const s1 = create(() => {}, schema as never) as any;
    const s2 = create(() => {}, schema as never) as any;
    s1.run({ a: 1 });
    s2.run({ a: 1 });
    expect(s1.get().hasErrors('a')).toBe(true);
    s1.remove('a');
    expect(s1.get().hasErrors('a')).toBe(false);
    expect(s2.get().hasErrors('a')).toBe(true);
    expect(s2.run({ a: 'ok' }).hasErrors()).toBe(false);
  });
});
