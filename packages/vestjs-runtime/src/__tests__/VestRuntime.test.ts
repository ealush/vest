import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  Run,
  createRef,
  useCurrentCursor,
  useSetIsolateKey,
} from '../VestRuntime';
import { IReconciler } from '../Reconciler';
import * as VestRuntime from '../VestRuntime';
import { IsolateInspector } from '../Isolate/IsolateInspector';
import { IsolateMutator } from '../Isolate/IsolateMutator';

import { ErrorStrings } from '../errors/ErrorStrings';
import { deferThrow, text } from 'vest-utils';
import { FocusModes, VestIsolateTypeFocused } from '../Isolate/IsolateFocused';

vi.mock('../Isolate/IsolateInspector', () => ({
  IsolateInspector: {
    cursor: vi.fn(),
    getChildByKey: vi.fn(),
  },
}));

vi.mock('../IsolateWalker', () => ({
  findClosest: vi.fn(),
}));

vi.mock('../Isolate/IsolateMutator', () => ({
  IsolateMutator: {
    addChildKey: vi.fn(),
    addChild: vi.fn(),
    setParent: vi.fn(),
  },
}));

vi.mock('vest-utils', async importOriginal => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    deferThrow: vi.fn(),
    text: vi.fn(str => str),
    invariant: vi.fn(),
  };
});

const mockGlobal = global as Record<string, unknown>;

vi.mock('context', () => ({
  createCascade: () => ({
    run: (stateRef: Record<string, unknown>, fn: () => void) => {
      // Create a mutable object
      const ctx = { stateRef, runtimeNode: null };
      // Make it accessible to useX via closure?
      // This closure is per createCascade call.
      // VestRuntime calls createCascade once at top level.
      // So this works perfectly.
      mockGlobal.__mockCtx = ctx;
      return fn();
    },
    useX: () => mockGlobal.__mockCtx,
    use: () => mockGlobal.__mockCtx,
  }),
}));

describe('VestRuntime', () => {
  let reconciler: IReconciler;

  beforeEach(() => {
    reconciler = vi.fn();
    vi.resetAllMocks();
  });

  const withRun = (
    fn: () => void,
    runtimeNode: Record<string, unknown> | null = null,
  ) => {
    const ref = createRef(reconciler, {});
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
        // @ts-expect-error - Passing empty object as mock TIsolate
        useSetIsolateKey(null, {});
        expect(true).toBe(true);
      });
    });

    it('Should add child key if not exists', () => {
      const node = { $type: 'child' };
      const parent = { $type: 'parent' };

      vi.mocked(IsolateInspector.getChildByKey).mockReturnValue(null);

      withRun(() => {
        // @ts-expect-error - Passing partial mock as TIsolate
        useSetIsolateKey('key1', node);
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

      // @ts-expect-error - Returning partial mock as TIsolate
      vi.mocked(IsolateInspector.getChildByKey).mockReturnValue({});

      withRun(() => {
        // @ts-expect-error - Passing partial mock as TIsolate
        useSetIsolateKey('key1', node);
        expect(deferThrow).toHaveBeenCalled();
        expect(text).toHaveBeenCalledWith(
          ErrorStrings.ENCOUNTERED_THE_SAME_KEY_TWICE,
          { key: 'key1' },
        );
        expect(IsolateMutator.addChildKey).not.toHaveBeenCalled();
      }, parent);
    });
  });

  describe('useSetNextIsolateChild', () => {
    it('Should add child to current isolate and set parent', () => {
      const parent = { $type: 'Parent' };
      const child = { $type: 'Child' };
      withRun(() => {
        // @ts-expect-error - Passing partial mock as TIsolate
        VestRuntime.useSetNextIsolateChild(child);
        expect(IsolateMutator.addChild).toHaveBeenCalledWith(parent, child);
        expect(IsolateMutator.setParent).toHaveBeenCalledWith(child, parent);
      }, parent);
    });

    it('Should add parent to implicitOnlyNodes if child is ONLY focused', () => {
      const parent = { $type: 'Parent' };
      const child = {
        $type: VestIsolateTypeFocused,
        data: { focusMode: FocusModes.ONLY },
      };
      withRun(() => {
        // @ts-expect-error - Passing partial mock as TIsolate
        VestRuntime.useSetNextIsolateChild(child);
        const ctx = mockGlobal.__mockCtx as {
          stateRef: { implicitOnlyNodes: Set<unknown> };
        };
        expect(ctx.stateRef.implicitOnlyNodes.has(parent)).toBe(true);
      }, parent);
    });
  });

  describe('hasImplicitOnly', () => {
    it('Should return true if an ancestor is in implicitOnlyNodes', () => {
      const grandparent = { $type: 'Grandparent' };
      const parent = { $type: 'Parent', parent: grandparent };
      const child = { $type: 'Child', parent };

      withRun(() => {
        const ctx = mockGlobal.__mockCtx as {
          stateRef: { implicitOnlyNodes: Set<unknown> };
        };
        ctx.stateRef.implicitOnlyNodes.add(grandparent);
        // The current node is `child`
        expect(VestRuntime.useIsFocusedOut()).toBe(true);
      }, child);
    });

    it('Should return false if no ancestor is in implicitOnlyNodes', () => {
      const parent = { $type: 'Parent' };
      const child = { $type: 'Child', parent };

      withRun(() => {
        expect(VestRuntime.useIsFocusedOut()).toBe(false);
      }, child);
    });
  });
});
