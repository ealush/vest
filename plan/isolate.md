# Plan: Unified Isolate Status & Control Flow

## 0\. Context Analysis

- **Goal:** Unify the asynchronous node logic control flow by moving the "runtime status" (`PENDING`, `DONE`, `INITIAL`) to `vestjs-runtime` and separating the "test validation status" (`PASSING`, `FAILED`, `SKIPPED`, etc.) in `vest`.
- **Relevant Files:**
  - `packages/vestjs-runtime/src/Isolate/Isolate.ts`
  - `packages/vestjs-runtime/src/Isolate/IsolateMutator.ts`
  - `packages/vest/src/core/isolate/IsolateTest/VestTest.ts`
  - `packages/vest/src/core/StateMachines/IsolateTestStateMachine.ts`
  - `packages/vest/src/core/StateMachines/CommonStateMachine.ts` (Moving to runtime)
  - `packages/vest/src/core/VestBus/VestBus.ts`
  - `packages/vest/src/exports/SuiteSerializer.ts`
- **Key Patterns:**
  - `vestjs-runtime` manages the tree structure and execution.
  - `vest` manages the validation domain logic.
  - `StateMachine` from `vest-utils` is used for state transitions.
- **Strategy:**
  1. **vestjs-runtime:** Establish `status` as a required runtime property (`INITIAL` | `PENDING` | `DONE`) and manage it via a new `IsolateStateMachine`.
  2. **vest:** Introduce `testStatus` (or similar) on `VestTest` for validation states (`STARTED`, `FAILED`, `PASSING`, etc.), separating it from the runtime status.
  3. **Migration:** Update serialization and event bus to respect this separation.

## Phase 1: VestJS Runtime - Strict Runtime Status

In this phase, we formalize the `status` property in `vestjs-runtime` to strictly handle execution state (`INITIAL`, `PENDING`, `DONE`).

- [ ] **Pre-Verify:** `yarn build && yarn test run`

- [ ] **TDD Contract:** Create `packages/vestjs-runtime/src/Isolate/__tests__/IsolateStatus.test.ts`

  ```typescript
  import { Isolate, IsolateStatus } from 'vestjs-runtime';
  import { isPromise } from 'vest-utils';

  describe('Isolate Status Transitions', () => {
    it('Should initialize with INITIAL status', () => {
      const isolate = Isolate.create('Test', () => {});
      expect(isolate.status).toBe(IsolateStatus.INITIAL);
    });

    it('Should transition to DONE for sync callbacks', () => {
      const isolate = Isolate.create('Test', () => {});
      expect(isolate.status).toBe(IsolateStatus.DONE);
    });

    it('Should transition to PENDING then DONE for async callbacks', async () => {
      let resolve;
      const promise = new Promise(r => (resolve = r));
      let isolate;

      await new Promise<void>(done => {
        isolate = Isolate.create('AsyncTest', async () => {
          await promise;
        });
        // Check pending immediately after creation (synchronous part of creation finishes)
        // However, Isolate.create returns the child.
        // We need to capture the reference.
        done();
      });

      // Since Isolate.create runs the callback, for async it returns the isolate
      // which should be PENDING state before the promise resolves
      expect(isolate.status).toBe(IsolateStatus.PENDING);

      resolve();
      await promise;

      // Wait for microtasks
      await new Promise(process.nextTick);

      expect(isolate.status).toBe(IsolateStatus.DONE);
    });
  });
  ```

- [ ] **Implement Step 1: Define Status Constants & Machine**
  - Create `packages/vestjs-runtime/src/Isolate/IsolateStatus.ts`:
    - Export `IsolateStatus` object/enum with `INITIAL`, `PENDING`, `DONE`.
  - Create `packages/vestjs-runtime/src/Isolate/IsolateStateMachine.ts`:
    - Move the logic from `vest/src/core/StateMachines/CommonStateMachine.ts` here.
    - Ensure it exports `IsolateStateMachine`.

- [ ] **Implement Step 2: Update Isolate Types & Creation**
  - Edit `packages/vestjs-runtime/src/Isolate/Isolate.ts`:
    - Import `IsolateStatus`.
    - Update `TIsolate`: `[IsolateKeys.Status]` should be required (non-optional) string.
    - Update `baseIsolate`: Set default `status` to `IsolateStatus.INITIAL`.
    - Update `Isolate.create`:
      - Ensure `status` is initialized.
      - In the `shouldRunNew` block (and `useRunAsNew`), ensure status transitions handled.

- [ ] **Implement Step 3: Mutator & Execution Logic**
  - Edit `packages/vestjs-runtime/src/Isolate/IsolateMutator.ts`:
    - Add `setStatus(isolate, status)` method.
  - Edit `packages/vestjs-runtime/src/Isolate/Isolate.ts` (`useRunAsNew` function):
    - Before callback execution: `IsolateMutator.setStatus(current, IsolateStatus.PENDING)`? No, usually starts `INITIAL`.
    - If `isPromise(output)`:
      - `IsolateMutator.setStatus(current, IsolateStatus.PENDING)`
      - On promise resolve: `IsolateMutator.setStatus(current, IsolateStatus.DONE)`
    - Else (sync):
      - `IsolateMutator.setStatus(current, IsolateStatus.DONE)`
  - **Note:** Remove the explicit `emit` calls if `IsolateStateMachine` or `Mutator` handles them, OR ensure `Mutator.setStatus` is called _alongside_ the emits. For now, keep emits to maintain compatibility, just ensure state is updated.

- [ ] **Verify Specific:** `yarn test packages/vestjs-runtime/src/Isolate/__tests__/IsolateStatus.test.ts`

- [ ] **Phase Summary:** Create `./plans/phase_1_runtime_status.md`

## Phase 2: Vest - Separate Validation Status

In this phase, we modify `VestTest` to use a dedicated property for validation results, decoupling it from the runtime execution status.

- [ ] **Pre-Verify:** `yarn test packages/vest/src/core/isolate/IsolateTest/__tests__/VestTest.test.ts`

- [ ] **TDD Contract:** Edit `packages/vest/src/core/isolate/IsolateTest/__tests__/VestTest.test.ts` (or create new `VestTestStatus.test.ts`):

  ```typescript
  import { VestTest } from '../VestTest';
  import { TestStatus } from '../../StateMachines/IsolateTestStateMachine';

  describe('VestTest Status Separation', () => {
    it('Should use "testStatus" data property for validation state', () => {
      const test = VestTest.create('field', () => {});

      // Initial state
      expect(VestTest.isUntested(test).unwrap()).toBe(true);

      // State transition
      VestTest.pass(test);
      expect(VestTest.isPassing(test).unwrap()).toBe(true);

      // Verify runtime status is NOT affected (it should be DONE from creation)
      expect(test.status).toBe('DONE');
    });

    it('Should handle STARTED state replacing PENDING', () => {
      const test = VestTest.create('field', () => {});
      VestTest.setStatus(test, TestStatus.STARTED);
      // We might not have an isStarted helper yet, but check underlying data
      expect(VestTest.getData(test).testStatus).toBe(TestStatus.STARTED);
    });
  });
  ```

- [ ] **Implement Step 1: Define TestStatus**
  - Edit `packages/vest/src/core/StateMachines/IsolateTestStateMachine.ts`:
    - Update `TestStatus` object:
      - Remove `PENDING` (runtime state).
      - Add `STARTED` (validation state).
    - Update the `machine` definition to handle transitions for `STARTED` (logic similar to old `PENDING`).

- [ ] **Implement Step 2: Update VestTest Data Structure**
  - Edit `packages/vest/src/core/isolate/IsolateTest/VestTest.ts`:
    - In `getData` / `setData`, ensure we are reading/writing `testStatus` from the payload `data`.
    - Modify `setStatus`:
      - Use `VestTest.setData` to update `testStatus` property.
      - Ensure it uses `IsolateTestStateMachine.transition`.
    - Update all `isXXX` methods (e.g., `isPassing`, `isFailing`) to read from `getData(test).testStatus` instead of `test.status`.
    - Update `awaitsResolution`: Check `isSkipped`, `isUntested` or `testStatus === TestStatus.STARTED` (replacing `isPending`).

- [ ] **Implement Step 3: Clean up VestBus**
  - Edit `packages/vest/src/core/VestBus/VestBus.ts`:
    - `ISOLATE_PENDING`: When this fires (runtime event), call `VestTest.setStatus(isolate, TestStatus.STARTED)`.
    - `ISOLATE_DONE`: When this fires, if the test is `STARTED`, it might need to resolve to `PASSING` (or default behavior).
    - Ensure `VestIsolate.setPending/setDone` are either removed (if redundant with runtime status) or updated to not conflict.

- [ ] **Verify Specific:** `yarn test packages/vest/src/core/isolate/IsolateTest/__tests__/VestTest.test.ts`

- [ ] **Phase Summary:** Create `./plans/phase_2_vest_status.md`

## Phase 3: Integration & Serialization

Ensure the new structures are correctly serialized and exposed.

- [ ] **Pre-Verify:** `yarn test packages/vest/src/exports/__tests__/SuiteSerializer.test.ts`

- [ ] **TDD Contract:** Edit `packages/vest/src/exports/__tests__/SuiteSerializer.test.ts`:

  ```typescript
  // Add a test case ensuring 'testStatus' is serialized and 'status' (runtime) is handled appropriately
  it('Should serialize testStatus and omit internal runtime status if needed', () => {
    // ... setup suite ...
    const dumped = SuiteSerializer.dump();
    // Expect dumped data to contain testStatus
  });
  ```

- [ ] **Implement Step 1: Update Serializer**
  - Edit `packages/vest/src/exports/SuiteSerializer.ts`:
    - Update `AllowedStatuses`: Map to new `TestStatus` values.
    - In `suiteSerializerReplacer`:
      - Stop checking `key === IsolateKeys.Status` for validation logic.
      - Check `key === 'testStatus'` (or whatever key is used in data) and validate against `AllowedStatuses`.
      - Potentially strip `status` (runtime) if it's not needed in the dump.

- [ ] **Implement Step 2: Verify & Cleanup**
  - Run full test suite to catch any regressions in `vest` core logic.
  - Check `packages/vest/src/core/StateMachines/CommonStateMachine.ts` -\> Delete if fully moved to `vestjs-runtime`.

- [ ] **Verify Regression:** `yarn test`

- [ ] **Phase Summary:** Create `./plans/phase_3_integration.md`
