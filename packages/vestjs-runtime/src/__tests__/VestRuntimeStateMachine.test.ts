import { describe, it, expect } from 'vitest';
import { VestRuntime } from '../vestjs-runtime';
import { IsolateMutator } from '../Isolate/IsolateMutator';
import { Isolate } from '../Isolate/Isolate';
import { RuntimeState } from '../Orchestrator/RuntimeStates';

describe('Runtime Orchestration', () => {
  it('Should transition to PENDING if an isolate is pending after mount', () => {
    VestRuntime.Run(VestRuntime.createRef({} as any, {} as any), () => {
      // Create a pending isolate
      const isolate = Isolate.create('test', async () => {
        await new Promise(() => {});
      });

      IsolateMutator.setParent(isolate, VestRuntime.useAvailableRoot());
      IsolateMutator.setPending(isolate);

      expect(VestRuntime.useRuntimeState()).toBe(RuntimeState.PENDING);
    });
  });

  it('Should transition to STABLE when pending isolate is done', () => {
    VestRuntime.Run(VestRuntime.createRef({} as any, {} as any), () => {
      const isolate = Isolate.create('test', async () => {
        await new Promise(() => {});
      });
      IsolateMutator.setParent(isolate, VestRuntime.useAvailableRoot());
      IsolateMutator.setPending(isolate);

      // Mark as done
      IsolateMutator.setDone(isolate);

      expect(VestRuntime.useRuntimeState()).toBe(RuntimeState.STABLE);
    });
  });
});
