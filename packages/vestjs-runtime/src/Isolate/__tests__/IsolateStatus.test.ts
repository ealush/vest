import { Isolate, IsolateStatus, TIsolate, VestRuntime } from 'vestjs-runtime';
import { describe, it, expect } from 'vitest';

describe('Isolate Status Transitions', () => {
  it('Should initialize with INITIAL status', () => {
    VestRuntime.Run(VestRuntime.createRef({} as any, {} as any), () => {
      Isolate.create('Test', isolate => {
        expect(isolate.status).toBe(IsolateStatus.INITIAL);
      });
    });
  });

  it('Should transition to DONE for sync callbacks', () => {
    VestRuntime.Run(VestRuntime.createRef({} as any, {} as any), () => {
      const isolate = Isolate.create('Test', () => {});
      expect(isolate.status).toBe(IsolateStatus.DONE);
    });
  });

  it('Should transition to PENDING then DONE for async callbacks', async () => {
    let resolve: (_value?: unknown) => void = () => {};
    const promise = new Promise(r => (resolve = r));
    const isolate = await new Promise<TIsolate>(done => {
      VestRuntime.Run(VestRuntime.createRef({} as any, {} as any), () => {
        const createdIsolate = Isolate.create('AsyncTest', async () => {
          await promise;
        });
        done(createdIsolate);
      });
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
