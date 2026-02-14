import { describe, it, expect, vi } from 'vitest';
import { CB } from 'vest-utils';

import { IReconciler } from '../Reconciler';
import { Isolate, TIsolate } from '../Isolate/Isolate';
import * as VestRuntime from '../VestRuntime';
import { StateRefType } from '../VestRuntime';

/**
 * A reconciler that returns the history node when types match,
 * causing Isolate.create to skip the callback (reconciled, not re-run).
 * When types don't match or history is missing, it returns null
 * so the node runs as new.
 */
function reuseReconciler(
  currentNode: TIsolate,
  historyNode: TIsolate,
): TIsolate | null {
  // Always re-run Root so its callback executes and creates children.
  if (currentNode.$type === 'Root') {
    return null;
  }
  if (currentNode.$type === historyNode.$type) {
    return historyNode;
  }
  return null;
}

describe('Reconciler: Transient Isolates', () => {
  function withRunTime<T>(stateRef: StateRefType, fn: CB<T>) {
    return VestRuntime.Run(stateRef, () => fn());
  }

  /**
   * Creates a fresh history tree. Uses a pass-through reconciler
   * (returns null → BaseReconciler → runs as new) so all callbacks execute.
   */
  function createHistory(fn: CB): TIsolate {
    const tempRef = VestRuntime.createRef(
      (() => null) as unknown as IReconciler,
      v => v,
    );
    let root!: TIsolate;
    withRunTime(tempRef, () => {
      root = fn();
    });
    return root;
  }

  /**
   * Creates a stateRef wired to the `reuseReconciler` and seeds it
   * with the given history root.
   */
  function createReconcilerRef(historyRoot: TIsolate): StateRefType {
    const ref = VestRuntime.createRef(
      reuseReconciler as unknown as IReconciler,
      v => v,
    );
    const [, setHistory] = ref.historyRoot();
    setHistory(historyRoot);
    return ref;
  }

  type NodeSpec = { type: string; key?: string; transient?: boolean };

  function buildTree(specs: NodeSpec[]): CB {
    return () =>
      Isolate.create('Root', () => {
        for (const spec of specs) {
          Isolate.create(
            spec.type,
            () => {},
            spec.transient ? { transient: true } : {},
            spec.key ?? null,
          );
        }
      });
  }

  const A: NodeSpec = { type: 'Test', key: 'A' };
  const B: NodeSpec = { type: 'Test', key: 'B' };
  const T: NodeSpec = { type: 'Skip', transient: true };

  it.each([
    {
      label: 'Adding: History [A, B] → Current [A, T, B]',
      history: [A, B],
      current: [A, T, B],
      callsA: 0,
      callsB: 0,
    },
    {
      label: 'Removing: History [A, T, B] → Current [A, B]',
      history: [A, T, B],
      current: [A, B],
      callsA: 0,
      callsB: 0,
    },
    {
      label: 'Moving: History [T, A, B] → Current [A, T, B]',
      history: [T, A, B],
      current: [A, T, B],
      callsA: 0,
      callsB: 0,
    },
    {
      label: 'Baseline: History [A, B] → Current [A, B]',
      history: [A, B],
      current: [A, B],
      callsA: 0,
      callsB: 0,
    },
    {
      label: 'New node: History [A] → Current [A, B]',
      history: [A],
      current: [A, B],
      callsA: 0,
      callsB: 1,
    },
  ])(
    '$label',
    ({ history, current, callsA: expectedCallsA, callsB: expectedCallsB }) => {
      const cbA = vi.fn();
      const cbB = vi.fn();

      const historyRoot = createHistory(buildTree(history));

      const ref = createReconcilerRef(historyRoot);
      withRunTime(ref, () => {
        Isolate.create('Root', () => {
          for (const spec of current) {
            const cb =
              spec.key === 'A' ? cbA : spec.key === 'B' ? cbB : () => {};
            Isolate.create(
              spec.type,
              cb,
              spec.transient ? { transient: true } : {},
              spec.key ?? null,
            );
          }
        });
      });

      expect(cbA).toHaveBeenCalledTimes(expectedCallsA);
      expect(cbB).toHaveBeenCalledTimes(expectedCallsB);
    },
  );

  it('Transient callback itself DOES run (it has no history)', () => {
    const cbTrans = vi.fn();

    const historyRoot = createHistory(buildTree([A, B]));

    const ref = createReconcilerRef(historyRoot);
    withRunTime(ref, () => {
      Isolate.create('Root', () => {
        Isolate.create('Test', () => {}, {}, 'A');
        Isolate.create('Skip', cbTrans, { transient: true });
        Isolate.create('Test', () => {}, {}, 'B');
      });
    });

    // Transient nodes always run as new
    expect(cbTrans).toHaveBeenCalledOnce();
  });
});
