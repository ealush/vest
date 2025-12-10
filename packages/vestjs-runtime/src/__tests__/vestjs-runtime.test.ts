import { describe, it, expect } from 'vitest';
import * as VestJSRuntime from '../vestjs-runtime';

describe('vestjs-runtime exports', () => {
  it('should export public API', () => {
    expect(VestJSRuntime.Isolate).toBeDefined();
    expect(VestJSRuntime.IsolateKeys).toBeDefined();
    expect(VestJSRuntime.Reconciler).toBeDefined();
    expect(VestJSRuntime.Walker).toBeDefined();
    expect(VestJSRuntime.VestRuntime).toBeDefined();
    expect(VestJSRuntime.IsolateInspector).toBeDefined();
    expect(VestJSRuntime.IsolateMutator).toBeDefined();
    expect(VestJSRuntime.Bus).toBeDefined();
    expect(VestJSRuntime.IsolateSelectors).toBeDefined();
    expect(VestJSRuntime.IsolateSerializer).toBeDefined();
    expect(VestJSRuntime.IsolateStatus).toBeDefined();
    expect(VestJSRuntime.IsolateStateMachine).toBeDefined();
  });
});
