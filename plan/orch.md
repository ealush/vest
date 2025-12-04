Yes, absolutely. In fact, **that is the primary architectural gain** of this entire refactor.

Currently, `vest` behaves like a "Pull" system: it constantly asks the tree _"Are you done? How about now?"_ by traversing it (O(N)).
By moving the `Set<Isolate>` of pending nodes to `vestjs-runtime`, we convert it to a "Push" system. The Runtime knows exactly what is pending (O(P), where P is usually \< 5).

This plan details how to **stop counting in the suite** and start **trusting the runtime**.

---

# Master Plan: The Runtime "Source of Truth"

## **Goal**

Remove all O(N) "pending" checks from `vest` (the suite). Instead, expose the `pendingIsolates` Set from `vestjs-runtime` and use it to perform instant O(1) or O(P) lookups for suite and field status.

## **Phase 1: Expose & Verify the Registry**

**Step 1: Verify `VestRuntime` Exports**
We need to ensure `vest` can access the raw Set of pending isolates.

- **Status:** ✅ Already done in `VestRuntime.ts`. `RuntimeApi.usePendingIsolates()` returns `Set<TIsolate>`.

**Step 2: Create Efficient Selectors (TDD)**
We need a new selector module in `vest` that replaces the heavy `TestWalker` logic with lightweight Set iteration.

- **Test File:** `packages/vest/src/core/selectors/__tests__/useIsPending.test.ts`
- **Test Content:**

  ```typescript
  import { describe, it, expect, vi, beforeEach } from 'vitest';
  import { VestRuntime, IsolateMutator } from 'vestjs-runtime';
  import * as vest from 'vest';
  import { useIsPending } from '../useIsPending';

  describe('useIsPending', () => {
    it('Should return true if there are pending isolates in the runtime', () => {
      vest.create(() => {
        // Manually simulate a pending isolate in the runtime
        // This mimics a test running async
        const isolate = { id: '1', data: { fieldName: 'f1' } };
        VestRuntime.registerPending(isolate);

        expect(useIsPending()).toBe(true);
        expect(useIsPending('f1')).toBe(true);
        expect(useIsPending('f2')).toBe(false); // Field filtering

        VestRuntime.removePending(isolate);
      })();
    });
  });
  ```

## **Phase 2: Refactor `vest` Logic**

**Step 3: Implement the Selector**
Create the efficient replacement for tree walking.

- **File:** `packages/vest/src/core/selectors/useIsPending.ts`
- **Content:**

  ```typescript
  import { RuntimeApi } from 'vestjs-runtime';
  import { VestTest } from '../isolate/IsolateTest/VestTest';

  export function usePendingIsolates() {
    const [pending] = RuntimeApi.usePendingIsolates();
    return pending; // Returns Set<Isolate>
  }

  export function useIsPending(fieldName?: string): boolean {
    const pending = usePendingIsolates();

    if (pending.size === 0) return false;
    if (!fieldName) return true; // Global pending check

    // Optimization: Iterate ONLY the small set of pending tests (Size ~3)
    // Instead of the entire tree (Size ~1000)
    for (const isolate of pending) {
      if (VestTest.getData(isolate).fieldName === fieldName) {
        return true;
      }
    }

    return false;
  }
  ```

**Step 4: Replace `SuiteWalker` Usage**
Find all expensive calls and replace them.

- **Target 1: `runCallbacks.ts`**
  - **Old:** `TestWalker.someTests(test => test.isPending())`
  - **New:** `useIsPending(fieldName)`

- **Target 2: `SuiteResult` (selectors)**
  - **File:** `packages/vest/src/suiteResult/selectors/isPending.ts` (or similar)
  - **Old:** Walks the produced result object or tree.
  - **New:** Query the Runtime state directly if inside the active run, or rely on the summary object.

## **Phase 3: Delete The Tally Logic**

**Step 5: Remove `hasRemainingTests`**
The ultimate cleanup.

- **Remove:** `packages/vest/src/core/isolate/IsolateTest/hasRemainingTests.ts`
- **Refactor:** `packages/vest/src/core/isolate/IsolateTest/TestWalker.ts`
  - Remove methods like `hasNoTests` if they were only used for pending checks.

---

## **Implementation Checklist**

- [ ] **Create:** `packages/vest/src/core/selectors/useIsPending.ts` implementing the O(P) logic.
- [ ] **Create:** `packages/vest/src/core/selectors/__tests__/useIsPending.test.ts` (TDD).
- [ ] **Refactor:** `packages/vest/src/suite/runCallbacks.ts` to use `useIsPending`.
- [ ] **Refactor:** `packages/vest/src/suiteResult/selectors/isPending.ts` to use `useIsPending`.
- [ ] **Delete:** `hasRemainingTests` logic from `TestWalker`.
- [ ] **Verify:** Run `integration.async-tests.test.ts` to ensure async completion still fires correctly.

## **Why this is safer/better?**

| Metric          | Old Architecture (`TestWalker`)              | New Architecture (`RuntimeSet`)                |
| :-------------- | :------------------------------------------- | :--------------------------------------------- |
| **Complexity**  | **O(N)** (Walks every node in the tree)      | **O(P)** (Iterates only pending nodes)         |
| **Reliability** | Fragile (Depends on correct traversal order) | Robust (Single Source of Truth)                |
| **Memory**      | Low (Computed on fly)                        | Low (Set of references)                        |
| **Speed**       | Slows down as form grows                     | Constant time (nearly) regardless of form size |
