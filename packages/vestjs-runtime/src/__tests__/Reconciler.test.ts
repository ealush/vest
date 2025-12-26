import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as VestRuntime from '../VestRuntime';
import { Reconciler } from '../Reconciler';
import { TIsolate } from '../Isolate/Isolate';
import { IsolateInspector } from '../Isolate/IsolateInspector';
import { IsolateMutator } from '../Isolate/IsolateMutator';

vi.mock('../VestRuntime', () => ({
  useHistoryIsolateAtCurrentPosition: vi.fn(),
  useReconciler: vi.fn(),
  useHistoryKey: vi.fn(),
  useSetIsolateKey: vi.fn(),
  useIsolate: vi.fn(),
  useHistoryIsolate: vi.fn(),
}));

vi.mock('../Isolate/IsolateInspector', () => ({
  IsolateInspector: {
    usesKey: vi.fn(),
    cursor: vi.fn(),
  },
}));

vi.mock('../Isolate/IsolateMutator', () => ({
  IsolateMutator: {
    slice: vi.fn(),
  },
}));

describe('Reconciler', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('reconcile', () => {
    let node: TIsolate;
    let historyNode: TIsolate;
    let mockReconciler: any;

    beforeEach(() => {
      node = { $type: 'TypeA' } as TIsolate;
      historyNode = { $type: 'TypeA' } as TIsolate;
      mockReconciler = vi.fn();

      vi.mocked(VestRuntime.useHistoryIsolateAtCurrentPosition).mockReturnValue(
        historyNode,
      );
      vi.mocked(VestRuntime.useReconciler).mockReturnValue(mockReconciler);
    });

    it('Should return the result of the reconciler function', () => {
      const nextNode = { $type: 'TypeA' } as TIsolate;
      mockReconciler.mockReturnValue(nextNode);

      expect(Reconciler.reconcile(node)).toBe(nextNode);
      expect(mockReconciler).toHaveBeenCalledWith(node, historyNode);
    });

    it('Should use BaseReconciler if reconciler returns nullish', () => {
      mockReconciler.mockReturnValue(null);
      // BaseReconciler returns node if historyNode is nullish,
      // or node if types match (implicit in BaseReconciler implementation being simple in the file I read?)
      // Wait, BaseReconciler implementation in file:
      // function BaseReconciler(currentNode, historyNode) {
      //   if (isNullish(historyNode)) return currentNode;
      //   return currentNode;
      // }
      // So it always returns currentNode.

      expect(Reconciler.reconcile(node)).toBe(node);
    });

    it('Should return node if history node is null', () => {
      vi.mocked(VestRuntime.useHistoryIsolateAtCurrentPosition).mockReturnValue(
        null,
      );
      expect(Reconciler.reconcile(node)).toBe(node);
    });

    it('Should return node if types mismatch', () => {
      const differentTypeNode = { $type: 'TypeB' } as TIsolate;
      // We need to make sure isSameIsolateType returns false.
      // It seems to check $type equality.
      vi.mocked(VestRuntime.useHistoryIsolateAtCurrentPosition).mockReturnValue(
        differentTypeNode,
      );

      expect(Reconciler.reconcile(node)).toBe(node);
      expect(mockReconciler).not.toHaveBeenCalled();
    });
  });

  describe('dropNextNodesOnReorder', () => {
    it('Should return false if not reordered', () => {
      const reorderLogic = vi.fn().mockReturnValue(false);
      expect(
        Reconciler.dropNextNodesOnReorder(
          reorderLogic,
          {} as TIsolate,
          {} as TIsolate,
        ),
      ).toBe(false);
    });

    it('Should return true and slice history if reordered', () => {
      const reorderLogic = vi.fn().mockReturnValue(true);
      const current = {} as TIsolate;
      const history = {} as TIsolate;

      vi.mocked(VestRuntime.useIsolate).mockReturnValue(current);
      vi.mocked(VestRuntime.useHistoryIsolate).mockReturnValue(history);
      vi.mocked(IsolateInspector.cursor).mockReturnValue(5);

      expect(
        Reconciler.dropNextNodesOnReorder(
          reorderLogic,
          {} as TIsolate,
          {} as TIsolate,
        ),
      ).toBe(true);
      expect(IsolateMutator.slice).toHaveBeenCalledWith(history, 5);
    });
  });

  describe('handleIsolateNodeWithKey', () => {
    it('Should return existing node if found in history by key', () => {
      const node = { key: 'key1' } as TIsolate;
      const prevNode = { key: 'key1', old: true } as unknown as TIsolate;
      const historyParent = { children: [prevNode] } as unknown as TIsolate;

      vi.mocked(IsolateInspector.usesKey).mockReturnValue(true);
      vi.mocked(VestRuntime.useHistoryIsolate).mockReturnValue(historyParent);

      expect(Reconciler.handleIsolateNodeWithKey(node, false)).toBe(prevNode);
      expect(VestRuntime.useSetIsolateKey).toHaveBeenCalledWith(
        'key1',
        prevNode,
      );
    });

    it('Should return new node if not found in history', () => {
      const node = { key: 'key1' } as TIsolate;
      const historyParent = { children: [] } as unknown as TIsolate;

      vi.mocked(IsolateInspector.usesKey).mockReturnValue(true);
      vi.mocked(VestRuntime.useHistoryIsolate).mockReturnValue(historyParent);

      expect(Reconciler.handleIsolateNodeWithKey(node, false)).toBe(node);
      expect(VestRuntime.useSetIsolateKey).toHaveBeenCalledWith('key1', node);
    });
  });

  describe('When history node is missing (handleNoHistoryNode)', () => {
    it('Should handle keyed node when history is missing', () => {
      const node = { key: 'alert' } as TIsolate;
      vi.mocked(VestRuntime.useHistoryIsolateAtCurrentPosition).mockReturnValue(
        null,
      );
      // Only usesKey true triggers the branch
      vi.mocked(IsolateInspector.usesKey).mockReturnValue(true);
      // We need handleIsolateNodeWithKey mock behavior or reliance on real impl?
      // Reconciler is the class under test, so its static methods are real.
      // But handleIsolateNodeWithKey is static on Reconciler.

      // Let's spy on handleIsolateNodeWithKey if we can, or just trust the integration.
      // Since it calls handleIsolateNodeWithKey, let's ensure it flows there.
      // handleIsolateNodeWithKey calls useHistoryKey etc.
      vi.mocked(VestRuntime.useHistoryKey).mockReturnValue(null);

      const result = Reconciler.reconcile(node);
      expect(result).toBe(node);
      expect(IsolateInspector.usesKey).toHaveBeenCalledWith(node);
    });
  });

  describe('dropNextNodesOnReorder guard', () => {
    it('Should return early if history or current node are missing', () => {
      const reorderLogic = vi.fn().mockReturnValue(true);
      vi.mocked(VestRuntime.useIsolate).mockReturnValue(null); // Force null
      vi.mocked(VestRuntime.useHistoryIsolate).mockReturnValue(null);

      expect(
        Reconciler.dropNextNodesOnReorder(
          reorderLogic,
          {} as TIsolate,
          {} as TIsolate,
        ),
      ).toBe(true);
      // Should NOT call slice
      expect(IsolateMutator.slice).not.toHaveBeenCalled();
    });
  });
});
