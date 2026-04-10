import { describe, it, expect } from 'vitest';
import * as vest from '../../../vest';

describe('useSetValidProperty with dependsOn', () => {
  it('should mark field as invalid if its dependency is invalid (Pillar 3)', () => {
    const suite = vest.create((data) => {
      vest.test('f1', () => { vest.enforce(data.f1).isNotEmpty(); });
      vest.test('f2', () => {}).dependsOn('f1');
    });

    const res = suite.run({ f1: '', f2: 'a' });

    expect(res.isValid('f1')).toBe(false);
    expect(res.isValid('f2')).toBe(false); // Invalid because f1 is invalid
  });

  it('should mark field as valid only if all dependencies are valid', () => {
    const suite = vest.create((data) => {
      vest.test('f1', () => { vest.enforce(data.f1).isNotEmpty(); });
      vest.test('f2', () => { vest.enforce(data.f2).isNotEmpty(); });
      vest.test('f3', () => {}).dependsOn('f1', 'f2');
    });

    const res1 = suite.run({ f1: 'a', f2: '', f3: 'a' });
    expect(res1.isValid('f3')).toBe(false);

    const res2 = suite.run({ f1: 'a', f2: 'a', f3: 'a' });
    expect(res2.isValid('f3')).toBe(true);
  });

  it('should handle transitive validity links', () => {
    const suite = vest.create((data) => {
      vest.test('f1', () => { vest.enforce(data.f1).isNotEmpty(); });
      vest.test('f2', () => {}).dependsOn('f1');
      vest.test('f3', () => {}).dependsOn('f2');
    });

    const res = suite.run({ f1: '', f2: 'a', f3: 'a' });

    expect(res.isValid('f1')).toBe(false);
    expect(res.isValid('f2')).toBe(false);
    expect(res.isValid('f3')).toBe(false);
  });

  it('should handle circular dependencies without crashing', () => {
    const suite = vest.create(() => {
      vest.test('f1', () => {}).dependsOn('f2');
      vest.test('f2', () => {}).dependsOn('f1');
    });

    const res = suite.run();

    expect(res.isValid('f1')).toBe(true);
    expect(res.isValid('f2')).toBe(true);
  });
});
