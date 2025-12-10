import {
  Isolate,
  IsolateStatus,
  TIsolate,
  VestRuntime,
  IsolateMutator,
} from 'vestjs-runtime';
import wait from 'wait';
import { describe, it, expect, vi } from 'vitest';

function mockRunTime(fn: () => void) {
  // We mock a minimal runtime context for the test
  const ref = {
    historyNode: null,
    runtimeNode: null,
    runtimeRoot: null,
  };
  return VestRuntime.Run(VestRuntime.createRef(ref as any, vi.fn()), fn);
}

describe('Isolate Status Propagation (HAS_PENDING)', () => {
  it('Should set all ancestors to HAS_PENDING when a child is async', async () => {
    let root!: TIsolate;
    let parent!: TIsolate;
    let child!: TIsolate;
    let resolveChild!: (value?: unknown) => void;

    mockRunTime(() => {
      root = Isolate.create('Root', () => {
        parent = Isolate.create('Parent', () => {
          child = Isolate.create(
            'Child',
            () =>
              new Promise(r => {
                resolveChild = r;
              }),
          );
        });
      });
    });

    expect(child.status).toBe(IsolateStatus.PENDING);
    expect(parent.status).toBe(IsolateStatus.HAS_PENDING);
    expect(root.status).toBe(IsolateStatus.HAS_PENDING);

    // This part tests the 'bubbleUpDone' logic (Phase 2 implementation)
    resolveChild();
    await wait(1); // Wait for microtask queue
    await wait(1); // Ensure all callbacks are resolved

    expect(child.status).toBe(IsolateStatus.DONE);
    expect(parent.status).toBe(IsolateStatus.DONE);
    expect(root.status).toBe(IsolateStatus.DONE);
  });
  it('Should remain HAS_PENDING if a sibling is still pending', async () => {
    let root!: TIsolate;
    let parent!: TIsolate;
    let child1!: TIsolate;
    let child2!: TIsolate;
    let resolve1!: (value?: unknown) => void;
    let resolve2!: (value?: unknown) => void;

    mockRunTime(() => {
      root = Isolate.create('Root', () => {
        parent = Isolate.create('Parent', () => {
          child1 = Isolate.create(
            'Child1',
            () =>
              new Promise(r => {
                resolve1 = r;
              }),
          );
          child2 = Isolate.create(
            'Child2',
            () =>
              new Promise(r => {
                resolve2 = r;
              }),
          );
        });
      });
    });

    expect(child1.status).toBe(IsolateStatus.PENDING);
    expect(child2.status).toBe(IsolateStatus.PENDING);
    expect(parent.status).toBe(IsolateStatus.HAS_PENDING);
    expect(root.status).toBe(IsolateStatus.HAS_PENDING);

    // Resolve first child
    resolve1();
    await wait(1); // Wait for microtask queue
    await wait(1); // Ensure callbacks

    // Parent should still be HAS_PENDING because Child2 is pending
    expect(child1.status).toBe(IsolateStatus.DONE);
    expect(child2.status).toBe(IsolateStatus.PENDING);
    expect(parent.status).toBe(IsolateStatus.HAS_PENDING);
    expect(root.status).toBe(IsolateStatus.HAS_PENDING);

    // Resolve second child
    resolve2();
    await wait(1); // Wait for microtask queue
    await wait(1);

    // Parent and root should now transition to DONE
    expect(child2.status).toBe(IsolateStatus.DONE);
    expect(parent.status).toBe(IsolateStatus.DONE);
    expect(root.status).toBe(IsolateStatus.DONE);
  });

  it('Should remain HAS_PENDING if an indirect descendant is pending', async () => {
    let parent!: TIsolate;
    let nestedParent!: TIsolate;
    let leaf!: TIsolate;
    let resolveLeaf!: (value?: unknown) => void;

    mockRunTime(() => {
      parent = Isolate.create('Parent', () => {
        nestedParent = Isolate.create('NestedParent', () => {
          leaf = Isolate.create(
            'Leaf',
            () =>
              new Promise(r => {
                resolveLeaf = r;
              }),
          );
        });
      });
    });

    expect(leaf.status).toBe(IsolateStatus.PENDING);
    expect(nestedParent.status).toBe(IsolateStatus.HAS_PENDING);
    expect(parent.status).toBe(IsolateStatus.HAS_PENDING);

    // Resolve leaf
    resolveLeaf();
    await wait(1); // Wait for microtask queue
    await wait(1);

    // All should transition to DONE
    expect(leaf.status).toBe(IsolateStatus.DONE);
    expect(nestedParent.status).toBe(IsolateStatus.DONE);
    expect(parent.status).toBe(IsolateStatus.DONE);
  });

  it('Should prevent manual setDone transition if children are active', async () => {
    let parent!: TIsolate;
    let child!: TIsolate;

    mockRunTime(() => {
      parent = Isolate.create('Parent', () => {
        child = Isolate.create(
          'Child',
          () => new Promise(() => {}), // Never resolves
        );
      });
    });

    expect(child.status).toBe(IsolateStatus.PENDING);
    expect(parent.status).toBe(IsolateStatus.HAS_PENDING);

    // Try to force setDone on parent
    mockRunTime(() => {
      IsolateMutator.setDone(parent);
    });

    // Should still be HAS_PENDING
    expect(parent.status).toBe(IsolateStatus.HAS_PENDING);
  });
});
