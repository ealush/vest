import { vi, describe, it, expect } from 'vitest';
import * as VestRuntime from '../VestRuntime';
import { Isolate } from '../Isolate/Isolate';
import { IsolateMutator } from '../Isolate/IsolateMutator';

describe('Isolate Watcher API', () => {
  it('Should allow registering a named watcher', () => {
    const Reconciler = {
      reconcile: vi.fn(node => node),
      removeAll: vi.fn(),
    } as any;
    const setter = vi.fn();

    const runtime = VestRuntime.createRef(Reconciler, setter);
    VestRuntime.Run(runtime, () => {
      VestRuntime.useRegisterIsolateWatcher(
        'TEST_WATCHER',
        iso => (iso as any).type === 'test',
      );

      // Should start empty (returns Iterable, convert to Array for comparison)
      const watched = Array.from(
        VestRuntime.useWatchedIsolates('TEST_WATCHER'),
      );
      expect(watched).toEqual([]);
    });
  });

  it('Should add isolates that match the criteria', () => {
    const Reconciler = {
      reconcile: vi.fn(node => node),
      removeAll: vi.fn(),
    } as any;
    const setter = vi.fn();

    const runtime = VestRuntime.createRef(Reconciler, setter);
    VestRuntime.Run(runtime, () => {
      VestRuntime.useRegisterIsolateWatcher(
        'TARGETS',
        iso => iso.data?.target === true,
      );

      // Create matching isolate (simulate mutation)
      const match = Isolate.create('test', () => {}, { target: true });
      VestRuntime.useAddWatchedIsolate(match);

      // Create non-matching isolate
      const noMatch = Isolate.create('test', () => {}, { target: false });
      VestRuntime.useAddWatchedIsolate(noMatch);

      // Convert Iterable to Array for assertions
      const watched = Array.from(VestRuntime.useWatchedIsolates('TARGETS'));
      expect(watched).toHaveLength(1);
      expect(watched[0]).toBe(match);
    });
  });

  it('Should automatically add isolates when they are attached', () => {
    const Reconciler = {
      reconcile: vi.fn(node => node),
      removeAll: vi.fn(),
    } as any;
    const setter = vi.fn();

    const runtime = VestRuntime.createRef(Reconciler, setter);
    VestRuntime.Run(runtime, () => {
      VestRuntime.useRegisterIsolateWatcher('ALL', () => true);

      // Create a node (which triggers setParent/addChild eventually)
      // When Isolate.create is called, it calls IsolateMutator.setParent.
      // If we hook IsolateMutator.setParent, this should be caught.
      const node = Isolate.create('test', () => {});

      // Convert Iterable to Array for assertions
      const watched = Array.from(VestRuntime.useWatchedIsolates('ALL'));
      expect(watched).toHaveLength(1);
      expect(watched[0]).toBe(node);
    });
  });

  it('Should skip silently if registering a duplicate key (idempotent)', () => {
    const Reconciler = {
      reconcile: vi.fn(node => node),
      removeAll: vi.fn(),
    } as any;
    const setter = vi.fn();

    const runtime = VestRuntime.createRef(Reconciler, setter);
    VestRuntime.Run(runtime, () => {
      const criteria1 = () => true;
      const criteria2 = () => false;

      // Register first time
      VestRuntime.useRegisterIsolateWatcher('IDEMPOTENT_KEY', criteria1);

      // Register again with same key - should NOT throw, should skip silently
      expect(() => {
        VestRuntime.useRegisterIsolateWatcher('IDEMPOTENT_KEY', criteria2);
      }).not.toThrow();

      // Verify original criteria is preserved (first registration wins)
      const node = Isolate.create('test', () => {});
      const watched = Array.from(
        VestRuntime.useWatchedIsolates('IDEMPOTENT_KEY'),
      );
      // If criteria1 is preserved (returns true), node should be in watcher
      expect(watched).toContain(node);
    });
  });

  it('Should recursively clean up children from watcher when parent is removed', () => {
    const Reconciler = {
      reconcile: vi.fn(node => node),
      removeAll: vi.fn(),
    } as any;
    const setter = vi.fn();

    const runtime = VestRuntime.createRef(Reconciler, setter);
    VestRuntime.Run(runtime, () => {
      VestRuntime.useRegisterIsolateWatcher('ALL', () => true);

      // Create a root node
      let child1: any;
      let child2: any;
      let parent: any;

      const root = Isolate.create('Root', () => {
        parent = Isolate.create('Parent', () => {
          child1 = Isolate.create('Child1', () => {});
          child2 = Isolate.create('Child2', () => {});
        });
      });

      // Verify all are watched
      let watched = Array.from(VestRuntime.useWatchedIsolates('ALL'));
      expect(watched).toContain(root);
      expect(watched).toContain(parent);
      expect(watched).toContain(child1);
      expect(watched).toContain(child2);
      expect(watched).toHaveLength(4);

      // Act: Remove parent from root (this should recursively remove parent, child1, child2)
      IsolateMutator.removeChild(root, parent);

      // Assert: Children should be gone from the watcher
      watched = Array.from(VestRuntime.useWatchedIsolates('ALL'));

      // Should only contain Root now. Parent, Child1, and Child2 should be gone.
      expect(watched).toContain(root);
      expect(watched).not.toContain(parent);
      expect(watched).not.toContain(child1);
      expect(watched).not.toContain(child2);
      expect(watched).toHaveLength(1);
    });
  });

  it('Should reset all watchers when useResetIsolateWatchers is called', () => {
    const Reconciler = {
      reconcile: vi.fn(node => node),
      removeAll: vi.fn(),
    } as any;
    const setter = vi.fn();

    const runtime = VestRuntime.createRef(Reconciler, setter);
    VestRuntime.Run(runtime, () => {
      VestRuntime.useRegisterIsolateWatcher('WATCHER_A', () => true);
      VestRuntime.useRegisterIsolateWatcher('WATCHER_B', () => true);

      // Add some nodes
      Isolate.create('test1', () => {});
      Isolate.create('test2', () => {});

      // Verify nodes are watched
      let watchedA = Array.from(VestRuntime.useWatchedIsolates('WATCHER_A'));
      let watchedB = Array.from(VestRuntime.useWatchedIsolates('WATCHER_B'));
      expect(watchedA).toHaveLength(2);
      expect(watchedB).toHaveLength(2);

      // Act: Reset watchers
      VestRuntime.useResetIsolateWatchers();

      // Assert: All watchers should be empty
      watchedA = Array.from(VestRuntime.useWatchedIsolates('WATCHER_A'));
      watchedB = Array.from(VestRuntime.useWatchedIsolates('WATCHER_B'));
      expect(watchedA).toHaveLength(0);
      expect(watchedB).toHaveLength(0);
    });
  });

  it('Should work with multiple independent watchers filtering different criteria', () => {
    const Reconciler = {
      reconcile: vi.fn(node => node),
      removeAll: vi.fn(),
    } as any;
    const setter = vi.fn();

    const runtime = VestRuntime.createRef(Reconciler, setter);
    VestRuntime.Run(runtime, () => {
      // Register watchers with different criteria
      VestRuntime.useRegisterIsolateWatcher(
        'TYPE_A',
        iso => iso.data?.type === 'A',
      );
      VestRuntime.useRegisterIsolateWatcher(
        'TYPE_B',
        iso => iso.data?.type === 'B',
      );
      VestRuntime.useRegisterIsolateWatcher('ALL_NODES', () => true);

      // Create nodes of different types
      const nodeA1 = Isolate.create('test', () => {}, { type: 'A' });
      const nodeA2 = Isolate.create('test', () => {}, { type: 'A' });
      const nodeB1 = Isolate.create('test', () => {}, { type: 'B' });
      const nodeC1 = Isolate.create('test', () => {}, { type: 'C' });

      // Verify TYPE_A watcher
      const watchedA = Array.from(VestRuntime.useWatchedIsolates('TYPE_A'));
      expect(watchedA).toContain(nodeA1);
      expect(watchedA).toContain(nodeA2);
      expect(watchedA).not.toContain(nodeB1);
      expect(watchedA).not.toContain(nodeC1);
      expect(watchedA).toHaveLength(2);

      // Verify TYPE_B watcher
      const watchedB = Array.from(VestRuntime.useWatchedIsolates('TYPE_B'));
      expect(watchedB).toContain(nodeB1);
      expect(watchedB).not.toContain(nodeA1);
      expect(watchedB).toHaveLength(1);

      // Verify ALL_NODES watcher
      const watchedAll = Array.from(
        VestRuntime.useWatchedIsolates('ALL_NODES'),
      );
      expect(watchedAll).toHaveLength(4);
    });
  });
});
