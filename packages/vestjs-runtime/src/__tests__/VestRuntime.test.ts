import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  Run,
  createRef,
  useCurrentCursor,
  useSetIsolateKey,
} from '../VestRuntime';
import { IRecociler } from '../Reconciler';
import * as VestRuntime from '../VestRuntime';
import { IsolateInspector } from '../Isolate/IsolateInspector';
import { IsolateMutator } from '../Isolate/IsolateMutator';

import { ErrorStrings } from '../errors/ErrorStrings';
import { deferThrow, text } from 'vest-utils';

// Mock dependencies but keep VestRuntime real or partially mock?
// Can't partially mock local file easily.
// But we can mock `IsolateMutator` and `IsolateInspector`.

vi.mock('../Isolate/IsolateInspector', () => ({
  IsolateInspector: {
    cursor: vi.fn(),
    getChildByKey: vi.fn(),
  },
}));

vi.mock('../Isolate/IsolateMutator', () => ({
  IsolateMutator: {
    addChildKey: vi.fn(),
  },
}));

vi.mock('vest-utils', async importOriginal => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    deferThrow: vi.fn(),
    text: vi.fn(str => str),
    invariant: vi.fn(),
  };
});

vi.mock('context', () => ({
  createCascade: () => ({
    run: (stateRef: any, fn: () => void) => {
      // Create a mutable object
      const ctx = { stateRef, runtimeNode: null };
      // Make it accessible to useX via closure?
      // This closure is per createCascade call.
      // VestRuntime calls createCascade once at top level.
      // So this works perfectly.
      (global as any).__mockCtx = ctx;
      return fn();
    },
    useX: () => (global as any).__mockCtx,
    use: () => (global as any).__mockCtx,
  }),
}));

describe('VestRuntime', () => {
  let reconciler: IRecociler;

  beforeEach(() => {
    reconciler = vi.fn();
    vi.resetAllMocks();
  });

  const withRun = (fn: () => void, runtimeNode: any = null) => {
    const ref = createRef(reconciler, {} as any);
    // Determine how to inject runtimeNode?
    // ref is internal state.
    // 'runtimeNode' property in context.
    // Run(ref, fn) -> PersistedContext.run sets the context.

    // We can't easily inject runtimeNode via `createRef`.
    // But we can use `PersistedContext.run(ctx, ...)` if we had access.
    // `createCascade` returns an object with `run`.

    // We can use a trick:
    // Run(ref, () => {
    //    // Inside here, useX().runtimeNode = runtimeNode;
    //    // But `runtimeNode` is on `CTXType` which `useX()` returns.
    //    // In `VestRuntime.ts`, `useX` returns `CTXType`.
    //    // We can mutate it!
    //    if (runtimeNode) {
    //      const ctx = VestRuntime.useX();
    //      ctx.runtimeNode = runtimeNode;
    //    }
    //    fn();
    // });

    Run(ref, () => {
      if (runtimeNode) {
        // @ts-ignore
        VestRuntime.useX().runtimeNode = runtimeNode;
      }
      fn();
    });
  };

  describe('useCurrentCursor', () => {
    it('Should return 0 when there is no active isolate', () => {
      withRun(() => {
        expect(useCurrentCursor()).toBe(0);
      });
    });

    it('Should return the cursor of the active isolate', () => {
      const node = { $type: 'test' };
      vi.mocked(IsolateInspector.cursor).mockReturnValue(10);

      withRun(() => {
        expect(useCurrentCursor()).toBe(10);
        expect(IsolateInspector.cursor).toHaveBeenCalledWith(node);
      }, node);
    });
  });

  describe('useSetIsolateKey', () => {
    it('Should return early if key is null', () => {
      withRun(() => {
        useSetIsolateKey(null, {} as any);
        expect(true).toBe(true);
      });
    });

    it('Should add child key if not exists', () => {
      const node = { $type: 'child' };
      const parent = { $type: 'parent' };

      vi.mocked(IsolateInspector.getChildByKey).mockReturnValue(null);

      withRun(() => {
        useSetIsolateKey('key1', node as any);
        expect(IsolateMutator.addChildKey).toHaveBeenCalledWith(
          parent,
          'key1',
          node,
        );
      }, parent);
    });

    it('Should deferThrow if key exists', () => {
      const node = { $type: 'child' };
      const parent = { $type: 'parent' };

      vi.mocked(IsolateInspector.getChildByKey).mockReturnValue({} as any);

      withRun(() => {
        useSetIsolateKey('key1', node as any);
        expect(deferThrow).toHaveBeenCalled();
        expect(text).toHaveBeenCalledWith(
          ErrorStrings.ENCOUNTERED_THE_SAME_KEY_TWICE,
          { key: 'key1' },
        );
        expect(IsolateMutator.addChildKey).not.toHaveBeenCalled();
      }, parent);
    });
  });
});
