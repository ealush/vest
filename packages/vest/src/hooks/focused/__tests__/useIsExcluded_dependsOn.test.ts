import { describe, it, expect } from 'vitest';
import * as vest from '../../../vest';

describe('useIsExcluded with dependsOn', () => {
  it('should include dependent field when dependency is focused (Pillar 1)', () => {
    const suite = vest.create(() => {
      vest.test('f1', () => {});
      vest.test('f2', () => {}).dependsOn('f1');
    });

    suite.run({ f1: 'a', f2: 'a' }); // Dirty f2
    const res = suite.only('f1').run({ f1: 'a', f2: 'b' });

    expect(res.isTested('f1')).toBe(true);
    expect(res.isTested('f2')).toBe(true);
  });

  it('should NOT include dependent field if it is not dirty (Pillar 2)', () => {
    const suite = vest.create(() => {
      vest.test('f1', () => {});
      vest.test('f2', () => {}).dependsOn('f1');
    });

    const res = suite.only('f1').run({ f1: 'a', f2: 'b' });

    expect(res.isTested('f1')).toBe(true);
    expect(res.isTested('f2')).toBe(false);
  });

  it('should support transitive dependencies (A -> B -> C)', () => {
    const suite = vest.create(() => {
      vest.test('f1', () => {});
      vest.test('f2', () => {}).dependsOn('f1');
      vest.test('f3', () => {}).dependsOn('f2');
    });

    suite.run(); // Dirty all
    const res = suite.only('f1').run();

    expect(res.isTested('f1')).toBe(true);
    expect(res.isTested('f2')).toBe(true);
    expect(res.isTested('f3')).toBe(true);
  });

  it('should respect skip() even if it is a focused dependency', () => {
    const suite = vest.create(() => {
      vest.test('f1', () => {});
      vest.skip('f2');
      vest.test('f2', () => {}).dependsOn('f1');
    });

    suite.run(); // Dirty f2
    const res = suite.only('f1').run();

    expect(res.isTested('f1')).toBe(true);
    expect(res.isTested('f2')).toBe(false); // Explicit skip takes precedence
  });
});
