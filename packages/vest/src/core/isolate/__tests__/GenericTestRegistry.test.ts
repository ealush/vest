import { describe, it, expect } from 'vitest';
import * as vest from 'vest';
import { VestRuntime } from 'vestjs-runtime';
import { VestIsolateType } from '../VestIsolateType';

describe('GenericTestRegistry', () => {
  it('should collect tests in refs', () => {
    let root: any;
    let t1: any;
    let t2: any;
    let t3: any;
    let g1: any;

    const suite = vest.create(() => {
      // confirm registration
      const trackers = VestRuntime.getTrackers();
      expect(trackers.length).toBeGreaterThan(0);
      expect(trackers.find(t => t.type === VestIsolateType.Test)).toBeDefined();

      t1 = vest.test('t1', () => {});
      t2 = vest.test('t2', () => {});

      g1 = vest.group('g1', () => {
        t3 = vest.test('t3', () => {});
      });

      root = VestRuntime.useAvailableRoot();
    });

    suite.run();

    expect(root).toBeDefined();

    // Check intermediate bubbling - refs now uses Set
    expect(g1).toBeDefined();
    expect(g1.refs).not.toBeNull();
    const g1Tests = g1.refs[VestIsolateType.Test];
    expect(g1Tests).toBeDefined();
    expect(g1Tests).toBeInstanceOf(Set);
    expect(g1Tests.has(t3)).toBe(true);

    const refs = root.refs;

    expect(refs).not.toBeNull();
    // Use the string value 'Test' because VestIsolateType.Test is 'Test'
    const tests = refs[VestIsolateType.Test];

    expect(tests).toBeDefined();
    expect(tests).toBeInstanceOf(Set);
    expect(tests.has(t1)).toBe(true);
    expect(tests.has(t2)).toBe(true);
    expect(tests.has(t3)).toBe(true);
  });
});
