import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as VestRuntime from '../../VestRuntime';
import { Isolate } from '../Isolate';
import {
  add,
  remove,
  prune,
  walk,
  getTracked,
  reprocessTree,
} from '../IsolateTracker';
import { IsolateKeys } from '../IsolateKeys';
import { TIsolate } from '../IsolateTypes';

describe('IsolateTracker Edge Cases', () => {
  let stateRef: any;

  beforeEach(() => {
    const reconciler = {
      reconcile: vi.fn(),
      removeAll: vi.fn(),
    };
    stateRef = VestRuntime.createRef(reconciler as any, {});
  });

  describe('remove() - O(1) delete', () => {
    it('should remove a specific item from refs', () => {
      VestRuntime.Run(stateRef, () => {
        VestRuntime.registerTracker({
          type: 'test',
          predicate: (node: any) => node.$type === 'test',
        });

        const root = Isolate.create('root', () => {});
        const test1 = Isolate.create('test', () => {});
        const test2 = Isolate.create('test', () => {});

        // Add both tests
        add(root, 'test', test1);
        add(root, 'test', test2);

        expect(root.refs?.['test']?.size).toBe(2);

        // Remove one
        const removed = remove(root, 'test', test1);

        expect(removed).toBe(true);
        expect(root.refs?.['test']?.size).toBe(1);
        expect(root.refs?.['test']?.has(test1)).toBe(false);
        expect(root.refs?.['test']?.has(test2)).toBe(true);
      });
    });

    it('should return false when removing non-existent item', () => {
      VestRuntime.Run(stateRef, () => {
        const root = Isolate.create('root', () => {});
        const test = Isolate.create('test', () => {});

        add(root, 'test', test);

        const nonExistent = Isolate.create('other', () => {});
        const removed = remove(root, 'test', nonExistent);

        expect(removed).toBe(false);
        expect(root.refs?.['test']?.size).toBe(1);
      });
    });

    it('should return false when refs type does not exist', () => {
      VestRuntime.Run(stateRef, () => {
        const root = Isolate.create('root', () => {});
        const test = Isolate.create('test', () => {});

        const removed = remove(root, 'non_existent_type', test);

        expect(removed).toBe(false);
      });
    });
  });

  describe('walk() - iteration with break', () => {
    it('should iterate over all tracked items', () => {
      VestRuntime.Run(stateRef, () => {
        const root = Isolate.create('root', () => {});
        const items: TIsolate[] = [];

        for (let i = 0; i < 5; i++) {
          const item = Isolate.create('test', () => {});
          add(root, 'test', item);
          items.push(item);
        }

        const visited: TIsolate[] = [];
        walk(root, 'test', node => {
          visited.push(node);
        });

        expect(visited.length).toBe(5);
        items.forEach(item => expect(visited).toContain(item));
      });
    });

    it('should break early when callback returns false', () => {
      VestRuntime.Run(stateRef, () => {
        const root = Isolate.create('root', () => {});

        for (let i = 0; i < 10; i++) {
          add(
            root,
            'test',
            Isolate.create('test', () => {}),
          );
        }

        let count = 0;
        walk(root, 'test', () => {
          count++;
          if (count >= 3) return false;
        });

        expect(count).toBe(3);
      });
    });

    it('should not crash when refs type does not exist', () => {
      VestRuntime.Run(stateRef, () => {
        const root = Isolate.create('root', () => {});

        let called = false;
        walk(root, 'non_existent', () => {
          called = true;
        });

        expect(called).toBe(false);
      });
    });
  });

  describe('prune() - predicate-based removal', () => {
    it('should remove items matching predicate', () => {
      VestRuntime.Run(stateRef, () => {
        const root = Isolate.create('root', () => {});
        const keep = Isolate.create('keep', () => {});
        const remove1 = Isolate.create('remove', () => {});
        const remove2 = Isolate.create('remove', () => {});

        add(root, 'test', keep);
        add(root, 'test', remove1);
        add(root, 'test', remove2);

        expect(root.refs?.['test']?.size).toBe(3);

        prune(root, 'test', node => node.$type === 'remove');

        expect(root.refs?.['test']?.size).toBe(1);
        expect(root.refs?.['test']?.has(keep)).toBe(true);
      });
    });

    it('should not crash when refs type does not exist', () => {
      VestRuntime.Run(stateRef, () => {
        const root = Isolate.create('root', () => {});

        // Should not throw
        prune(root, 'non_existent', () => true);

        expect(root.refs).toBeNull();
      });
    });
  });

  describe('getTracked() - returns array', () => {
    it('should return array of tracked items', () => {
      VestRuntime.Run(stateRef, () => {
        const root = Isolate.create('root', () => {});
        const test1 = Isolate.create('test', () => {});
        const test2 = Isolate.create('test', () => {});

        add(root, 'test', test1);
        add(root, 'test', test2);

        const tracked = getTracked(root, 'test');

        expect(Array.isArray(tracked)).toBe(true);
        expect(tracked.length).toBe(2);
        expect(tracked).toContain(test1);
        expect(tracked).toContain(test2);
      });
    });

    it('should return empty array when type does not exist', () => {
      VestRuntime.Run(stateRef, () => {
        const root = Isolate.create('root', () => {});

        const tracked = getTracked(root, 'non_existent');

        expect(Array.isArray(tracked)).toBe(true);
        expect(tracked.length).toBe(0);
      });
    });

    it('should return copy, not the original Set', () => {
      VestRuntime.Run(stateRef, () => {
        const root = Isolate.create('root', () => {});
        const test = Isolate.create('test', () => {});

        add(root, 'test', test);

        const tracked1 = getTracked(root, 'test');
        const tracked2 = getTracked(root, 'test');

        expect(tracked1).not.toBe(tracked2);
        expect(tracked1).toEqual(tracked2);
      });
    });
  });

  describe('reprocessTree() - hydration', () => {
    it('should rebuild refs from tree structure', () => {
      VestRuntime.Run(stateRef, () => {
        VestRuntime.registerTracker({
          type: 'target',
          predicate: (node: any) => node.$type === 'target',
        });

        // Build tree without bubbling (simulating deserialized state)
        const root = Isolate.create('root', () => {});
        const child = Isolate.create('group', () => {});
        const target1 = Isolate.create('target', () => {});
        const target2 = Isolate.create('target', () => {});

        // Manually set up tree structure
        root.children = [child];
        child.children = [target1, target2];

        // Refs should be null initially
        expect(root.refs).toBeNull();

        // Reprocess
        reprocessTree(root);

        // Now refs should be populated
        expect(root.refs?.['target']?.size).toBe(2);
        expect(root.refs?.['target']?.has(target1)).toBe(true);
        expect(root.refs?.['target']?.has(target2)).toBe(true);
      });
    });
  });

  describe('Deep tree handling', () => {
    it('should handle 100+ level deep trees without stack overflow', () => {
      VestRuntime.Run(stateRef, () => {
        VestRuntime.registerTracker({
          type: 'deep',
          predicate: (node: any) => node.$type === 'deep',
        });

        const root = Isolate.create('root', () => {});
        let current = root;

        // Create 150 levels deep
        for (let i = 0; i < 150; i++) {
          const child = Isolate.create('group', () => {});
          Object.assign(child, { [IsolateKeys.Parent]: current });
          current = child;
        }

        // Add a deep leaf
        const deepLeaf = Isolate.create('deep', () => {});
        Object.assign(deepLeaf, { [IsolateKeys.Parent]: current });

        // Should not throw - uses iterative loop
        add(root, 'deep', deepLeaf);

        expect(root.refs?.['deep']?.has(deepLeaf)).toBe(true);
      });
    });
  });

  describe('Deduplication', () => {
    it('should not add duplicate items (Set behavior)', () => {
      VestRuntime.Run(stateRef, () => {
        const root = Isolate.create('root', () => {});
        const test = Isolate.create('test', () => {});

        // Add same item multiple times
        add(root, 'test', test);
        add(root, 'test', test);
        add(root, 'test', test);

        expect(root.refs?.['test']?.size).toBe(1);
      });
    });
  });

  describe('Duplicate tracker registration', () => {
    it('should skip duplicate tracker types', () => {
      VestRuntime.Run(stateRef, () => {
        VestRuntime.registerTracker({
          type: 'test',
          predicate: () => true,
        });

        const initialCount = VestRuntime.getTrackers().length;

        // Try to register again
        VestRuntime.registerTracker({
          type: 'test',
          predicate: () => false, // Different predicate
        });

        // Should not add duplicate
        expect(VestRuntime.getTrackers().length).toBe(initialCount);
      });
    });
  });
});
