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

  describe('Adding a transient node', () => {
    it('History [A, B] → Current [A, T, B]: B should be reconciled, not re-run', () => {
      const cbA = vi.fn();
      const cbB = vi.fn();

      // Phase 1: Build history with [A, B]
      const historyRoot = createHistory(() =>
        Isolate.create('Root', () => {
          Isolate.create('Test', () => {}, {}, 'A');
          Isolate.create('Test', () => {}, {}, 'B');
        }),
      );

      // Phase 2: Re-run with [A, T, B] against history
      const ref = createReconcilerRef(historyRoot);
      withRunTime(ref, () => {
        Isolate.create('Root', () => {
          Isolate.create('Test', cbA, {}, 'A');
          Isolate.create('Skip', () => {}, { transient: true });
          Isolate.create('Test', cbB, {}, 'B');
        });
      });

      // A and B matched their history counterparts → reconciled, callbacks NOT called
      expect(cbA).not.toHaveBeenCalled();
      expect(cbB).not.toHaveBeenCalled();
    });

    it('Transient callback itself DOES run (it has no history)', () => {
      const cbTrans = vi.fn();

      const historyRoot = createHistory(() =>
        Isolate.create('Root', () => {
          Isolate.create('Test', () => {}, {}, 'A');
          Isolate.create('Test', () => {}, {}, 'B');
        }),
      );

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

  describe('Removing a transient node', () => {
    it('History [A, T, B] → Current [A, B]: B should be reconciled, not re-run', () => {
      const cbA = vi.fn();
      const cbB = vi.fn();

      // Phase 1: Build history with [A, T, B]
      const historyRoot = createHistory(() =>
        Isolate.create('Root', () => {
          Isolate.create('Test', () => {}, {}, 'A');
          Isolate.create('Skip', () => {}, { transient: true });
          Isolate.create('Test', () => {}, {}, 'B');
        }),
      );

      // Phase 2: Re-run with [A, B] against history (transient removed)
      const ref = createReconcilerRef(historyRoot);
      withRunTime(ref, () => {
        Isolate.create('Root', () => {
          Isolate.create('Test', cbA, {}, 'A');
          Isolate.create('Test', cbB, {}, 'B');
        });
      });

      // A and B matched their history counterparts → reconciled, callbacks NOT called
      expect(cbA).not.toHaveBeenCalled();
      expect(cbB).not.toHaveBeenCalled();
    });
  });

  describe('Moving a transient node', () => {
    it('History [T, A, B] → Current [A, T, B]: A and B should reconcile', () => {
      const cbA = vi.fn();
      const cbB = vi.fn();

      const historyRoot = createHistory(() =>
        Isolate.create('Root', () => {
          Isolate.create('Skip', () => {}, { transient: true });
          Isolate.create('Test', () => {}, {}, 'A');
          Isolate.create('Test', () => {}, {}, 'B');
        }),
      );

      const ref = createReconcilerRef(historyRoot);
      withRunTime(ref, () => {
        Isolate.create('Root', () => {
          Isolate.create('Test', cbA, {}, 'A');
          Isolate.create('Skip', () => {}, { transient: true });
          Isolate.create('Test', cbB, {}, 'B');
        });
      });

      expect(cbA).not.toHaveBeenCalled();
      expect(cbB).not.toHaveBeenCalled();
    });
  });

  describe('No transient nodes (baseline)', () => {
    it('History [A, B] → Current [A, B]: both should reconcile normally', () => {
      const cbA = vi.fn();
      const cbB = vi.fn();

      const historyRoot = createHistory(() =>
        Isolate.create('Root', () => {
          Isolate.create('Test', () => {}, {}, 'A');
          Isolate.create('Test', () => {}, {}, 'B');
        }),
      );

      const ref = createReconcilerRef(historyRoot);
      withRunTime(ref, () => {
        Isolate.create('Root', () => {
          Isolate.create('Test', cbA, {}, 'A');
          Isolate.create('Test', cbB, {}, 'B');
        });
      });

      expect(cbA).not.toHaveBeenCalled();
      expect(cbB).not.toHaveBeenCalled();
    });

    it('History [A] → Current [A, B]: A reconciles, B runs as new', () => {
      const cbA = vi.fn();
      const cbB = vi.fn();

      const historyRoot = createHistory(() =>
        Isolate.create('Root', () => {
          Isolate.create('Test', () => {}, {}, 'A');
        }),
      );

      const ref = createReconcilerRef(historyRoot);
      withRunTime(ref, () => {
        Isolate.create('Root', () => {
          Isolate.create('Test', cbA, {}, 'A');
          Isolate.create('Test', cbB, {}, 'B');
        });
      });

      expect(cbA).not.toHaveBeenCalled();
      expect(cbB).toHaveBeenCalledOnce(); // No history match → runs as new
    });
  });
});
