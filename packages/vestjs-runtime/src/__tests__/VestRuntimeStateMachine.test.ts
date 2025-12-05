import { describe, it, expect } from 'vitest';
import { VestRuntime } from '../vestjs-runtime';
import { IsolateMutator } from '../Isolate/IsolateMutator';
import { Isolate } from '../Isolate/Isolate';
import { RuntimeEvents } from '../RuntimeEvents';
import { RuntimeState } from '../Orchestrator/RuntimeStates';

describe('Runtime Orchestration', () => {
  it('Should transition to PENDING if an isolate is pending after mount', () => {
    VestRuntime.Run(VestRuntime.createRef({} as any, {} as any), () => {
      VestRuntime.dispatch({ type: RuntimeEvents.START_MOUNT });

      // Create a pending isolate
      const isolate = Isolate.create('test', () => {});
      IsolateMutator.setPending(isolate);

      VestRuntime.dispatch({ type: RuntimeEvents.END_MOUNT });

      const [state] = VestRuntime.useRuntimeState();
      expect(state).toBe(RuntimeState.PENDING);
    });
  });

  it('Should transition to STABLE when pending isolate is done', () => {
    VestRuntime.Run(VestRuntime.createRef({} as any, {} as any), () => {
      VestRuntime.dispatch({ type: RuntimeEvents.START_MOUNT });
      const isolate = Isolate.create('test', async () => {
        await new Promise(() => {});
      });
      IsolateMutator.setPending(isolate);
      VestRuntime.dispatch({ type: RuntimeEvents.END_MOUNT });

      // Mark as done
      IsolateMutator.setDone(isolate);

      const [state] = VestRuntime.useRuntimeState();
      expect(state).toBe(RuntimeState.STABLE);
    });
  });
});
