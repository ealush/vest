This is a solid implementation of **Phase 2 (Shadow Mode)**.

The fact that "all tests pass" confirms that adding the orchestration logic to `VestRuntime` and wiring it up via `IsolateMutator` did not regress existing behavior. You have successfully created a parallel "source of truth" for the runtime state.

However, the refactor is not yet complete. The system is currently maintaining **two** separate mechanisms for determining completion:

1.  **Legacy (Active):** `SuiteWalker` iterating over the tree checking `hasRemainingTests`.
2.  **New (Shadow):** `VestRuntime` tracking `pendingIsolates`.

To reach the finish line (**Phase 3: The Switchover**), we need to make `runCallbacks.ts` listen to the `VestRuntime` instead of asking `SuiteWalker`.

Here is the verification of your current files and the specific steps to finish the refactor.

### Verification Scorecard

| Component               | Status          | Notes                                                                                                                                    |
| :---------------------- | :-------------- | :--------------------------------------------------------------------------------------------------------------------------------------- |
| **`IsolateMutator.ts`** | ✅ **Verified** | Correctly hooks into `RuntimeApi.registerPending` and `removePending`. This ensures the runtime knows about async isolates.              |
| **`VestRuntime.ts`**    | ✅ **Verified** | Logic for `MOUNTING` vs `PENDING` vs `STABLE` looks sound. It correctly handles the race condition where a test finishes while mounting. |
| **`test.ts`**           | ✅ **Verified** | No changes needed here for now; it correctly delegates to `IsolateTest`.                                                                 |
| **`runCallbacks.ts`**   | ⚠️ **Legacy**   | Still uses `SuiteWalker.useHasRemaining...`. This is the bottleneck we need to remove.                                                   |

---

### The Missing Link: `Runtime.subscribe`

Currently, `VestRuntime.ts` manages the state correctly, but it keeps the "STABLE" status to itself (inside `TinyState`). To allow `vest` to react to this state change (and run callbacks), we need to expose a subscription mechanism or emit an event.

#### Step 1: Update `VestRuntime` to Notify

We need to trigger the internal Bus when the state becomes `STABLE`.

**File:** `packages/vestjs-runtime/src/VestRuntime.ts`

```typescript
// ... imports

// Add a specific event for stability
export enum RuntimeEvents {
  // ... existing
  ISOLATE_PENDING = 'ISOLATE_PENDING',
  ISOLATE_DONE = 'ISOLATE_DONE',
  BECOME_STABLE = 'BECOME_STABLE', // <--- Add this
}

// ... inside functions

function useHandleEndMount() {
  const [, setIsMounting] = useIsMounting();
  const [pendingIsolates] = usePendingIsolates();
  const [state, setState] = useRuntimeState();

  setIsMounting(false);
  if (pendingIsolates.size === 0 && state !== RuntimeState.STABLE) {
    setState(RuntimeState.STABLE);
    // Notify the world
    useX().stateRef.Bus.emit(RuntimeEvents.BECOME_STABLE);
  }
}

function useHandleIsolateDone(isolate: TIsolate) {
  const [pendingIsolates] = usePendingIsolates();
  const [state, setState] = useRuntimeState();
  const [isMounting] = useIsMounting();

  pendingIsolates.delete(isolate);
  if (
    pendingIsolates.size === 0 &&
    !isMounting &&
    state !== RuntimeState.STABLE
  ) {
    setState(RuntimeState.STABLE);
    // Notify the world
    useX().stateRef.Bus.emit(RuntimeEvents.BECOME_STABLE);
  }
}
```

#### Step 2: Update `runCallbacks.ts` to Listen

Now we replace the O(N) tree traversal with an O(1) state check.

**File:** `packages/vest/src/suite/runCallbacks.ts`

```typescript
import { isArray, callEach } from 'vest-utils';
import { RuntimeEvents, RuntimeApi, RuntimeState } from 'vestjs-runtime'; // Import new tools

import { useDoneCallbacks, useFieldCallbacks } from '../core/Runtime';
import { TFieldName } from '../suiteResult/SuiteResultTypes';

/**
 * Runs done callback per field when async tests are finished running.
 */
export function useRunFieldCallbacks(fieldName: TFieldName): void {
  const [fieldCallbacks] = useFieldCallbacks();

  // NEW: Check global state instead of iterating tree
  // We assume field callbacks run immediately if the field is done.
  // Note: For field-specific callbacks, we might still need a check
  // to see if *that specific field* is pending, unless we want to wait for the whole suite.
  // If we stick to "Done runs when Suite is Stable", use this:

  const isStable = RuntimeApi.useIsStable();

  if (isStable && isArray(fieldCallbacks[fieldName])) {
    callEach(fieldCallbacks[fieldName]);
  }
}

export function useRunSyncFieldCallbacks(): void {
  // ... similar logic
}

/**
 * Runs unlabelled done callback when async tests are finished running.
 */
export function useRunDoneCallbacks() {
  const [doneCallbacks] = useDoneCallbacks();
  const isStable = RuntimeApi.useIsStable();

  if (isStable) {
    callEach(doneCallbacks);
  }
}
```

### Critical Question for Implementation

**How are `useRunDoneCallbacks` triggered in your current flow?**

1.  **Sync:** At the end of the suite, `vest` calls `useRunDoneCallbacks`.
2.  **Async:** When a test finishes, `IsolateTestStateMachine` calls... what?

If `IsolateTestStateMachine` calls `VestBus.emit('TEST_COMPLETED')`, and you have a listener that calls `useRunDoneCallbacks`, then replacing the check inside `useRunDoneCallbacks` (as shown above) is sufficient.

**Recommendation:**
In `packages/vest/src/suite/createSuite.ts` (or where the suite is initialized), subscribe to the Runtime Event:

```typescript
// Inside suite initialization or a global setup
const { Bus } = RuntimeApi.useX();

Bus.on(RuntimeEvents.BECOME_STABLE, () => {
  useRunDoneCallbacks();
});
```

This effectively decouples the "Isolate Test" from knowing about "Suite Callbacks". The Test just says "I am done", the Runtime says "The Suite is Stable", and the Suite listens and fires callbacks.

# appendix: amended plan update

Based on your clarification, the documentation needs to accurately reflect that `after` and `afterField` are **event-driven hooks** that fire on _every_ relevant test completion, whereas `await suite.run()` is the exclusive method for handling the **final** stable state.

This distinction is critical for users migrating from v5 who might expect `done()` semantics (which usually meant "all done") from these callbacks.

Here is the documentation update plan.

---

# Documentation Update Plan

## **1. Update `handling_completion.md`**

**Location:** `website/docs/writing_your_suite/handling_completion.md`

**Goal:** Explicitly define the execution frequency of `after` and `afterField` to prevent user confusion regarding multiple firings during async flows.

### **Change List:**

1.  **Refine `Promise-based Handling`**: Emphasize that this is the _only_ way to guarantee a single, final completion event.
2.  **Update `suite.after()`**: Clarify that it runs after _each_ test completion, making it suitable for "progress" updates but potentially noisy for "completion" logic.
3.  **Update `suite.afterField()`**: Correct the statement "runs when all tests... have finished" to reflect that it runs after _each_ test for that field.

### **Content Updates:**

#### **Section 2: Using `suite.after(callback)`**

**Replace:**

> 1. It runs **immediately** if there are no pending tests (synchronous completion).
> 2. It runs **again** whenever an async test completes and the suite state updates.

**With:**

> 1. It runs **immediately** after the synchronous pass.
> 2. It runs **repeatedly** after **each** asynchronous test completes.
>
> **Note:** Do not use `after` for form submission logic, as it may fire multiple times before the suite is fully done. Use `await suite.run()` for final completion.

#### **Section 3: Using `suite.afterField(fieldName, callback)`**

**Replace:**

> `suite.afterField()` is a specialized hook that runs when all tests for a specific field have finished.

**With:**

> `suite.afterField()` is a specialized hook that runs whenever **a test for a specific field** finishes running.
>
> If a field has multiple asynchronous tests, this callback will run multiple times (once for each completing test). To check if the field is fully done, you can inspect `res.isTested(fieldName)` and `res.isPending(fieldName)` within the callback.

---

## **2. Actionable Checklist**

- [ ] Open `website/docs/writing_your_suite/handling_completion.md`.
- [ ] Apply the text replacements defined above.
- [ ] Verify the "Migration from V5" table is still accurate (it maps `done` -> `after`, which is technically correct API-wise, but semantically `await` is the closer equivalent for "done").
  - _Optional:_ Add a note in the Migration section: _"If you used `done()` to gate form submission, switch to `await suite.run()`."_
