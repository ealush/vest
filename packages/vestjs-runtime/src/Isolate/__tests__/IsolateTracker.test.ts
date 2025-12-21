import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as VestRuntime from '../../VestRuntime';
import { Isolate } from '../Isolate';
import { IsolateTracker } from '../IsolateTracker';
import { IsolateKeys } from '../IsolateKeys';

describe('IsolateTracker', () => {
  let stateRef: any;

  beforeEach(() => {
    const reconciler = {
      reconcile: vi.fn(),
      removeAll: vi.fn(),
    };
    stateRef = VestRuntime.createRef(reconciler as any, {});
  });

  it('should allow registering a tracker', () => {
    VestRuntime.Run(stateRef, () => {
      const tracker = {
        type: 'my_tracker',
        predicate: (node: any) => node.$type === 'target_type',
      };

      VestRuntime.registerTracker(tracker);
      expect(VestRuntime.getTrackers()).toContain(tracker);
    });
  });

  it('should bubble up matching nodes to ancestors', () => {
    VestRuntime.Run(stateRef, () => {
      VestRuntime.registerTracker({
        type: 'targets',
        predicate: (node: any) => node.$type === 'target',
      });

      const root = Isolate.create('root', () => {});
      const child = Isolate.create('group', () => {});
      const target = Isolate.create('target', () => {});

      // Simulate tree construction
      Object.assign(child, { [IsolateKeys.Parent]: root });
      Object.assign(target, { [IsolateKeys.Parent]: child });

      IsolateTracker.bubble(target, child);
      IsolateTracker.bubble(child, root);

      // refs now uses Set
      expect(root.refs?.['targets']).toBeInstanceOf(Set);
      expect(root.refs?.['targets']?.has(target)).toBe(true);
      expect(child.refs?.['targets']).toBeInstanceOf(Set);
      expect(child.refs?.['targets']?.has(target)).toBe(true);
    });
  });

  it('should handle multiple trackers', () => {
    VestRuntime.Run(stateRef, () => {
      VestRuntime.registerTracker({
        type: 't1',
        predicate: (node: any) => node.$type === 't1',
      });
      VestRuntime.registerTracker({
        type: 't2',
        predicate: (node: any) => node.$type === 't2',
      });

      const root = Isolate.create('root', () => {});
      const c1 = Isolate.create('t1', () => {});
      const c2 = Isolate.create('t2', () => {});

      // Simulate tree construction
      Object.assign(c1, { [IsolateKeys.Parent]: root });
      Object.assign(c2, { [IsolateKeys.Parent]: root });

      IsolateTracker.bubble(c1, root);
      IsolateTracker.bubble(c2, root);

      expect(root.refs?.['t1']?.has(c1)).toBe(true);
      expect(root.refs?.['t2']?.has(c2)).toBe(true);
    });
  });

  it('should correct bubble up nested matches', () => {
    VestRuntime.Run(stateRef, () => {
      VestRuntime.registerTracker({
        type: 'target',
        predicate: (node: any) => node.$type === 'target',
      });

      const root = Isolate.create('root', () => {});
      const mid = Isolate.create('group', () => {});
      const leaf = Isolate.create('target', () => {});

      // Hierarchy: root -> mid -> leaf

      // 1. Bubble leaf -> mid
      Object.assign(leaf, { [IsolateKeys.Parent]: mid });
      IsolateTracker.bubble(leaf, mid);

      expect(mid.refs?.['target']?.has(leaf)).toBe(true);

      // 2. Bubble mid -> root
      Object.assign(mid, { [IsolateKeys.Parent]: root });
      IsolateTracker.bubble(mid, root);

      // Should have taken the refs from mid and moved them to root
      expect(root.refs?.['target']?.has(leaf)).toBe(true);
    });
  });

  it('should not track nodes when predicate fails', () => {
    VestRuntime.Run(stateRef, () => {
      VestRuntime.registerTracker({
        type: 'target',
        predicate: (node: any) => node.$type === 'shiny',
      });

      const root = Isolate.create('root', () => {});
      const child = Isolate.create('dull', () => {});

      Object.assign(child, { [IsolateKeys.Parent]: root });
      IsolateTracker.bubble(child, root);

      expect(root.refs).toBeNull();
    });
  });
});
