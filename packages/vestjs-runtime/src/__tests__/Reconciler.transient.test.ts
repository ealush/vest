import { describe, it, expect, vi } from 'vitest';
import { CB } from 'vest-utils';

import { IReconciler } from '../Reconciler';
import { Isolate } from '../Isolate/Isolate';
import * as VestRuntime from '../VestRuntime';
import { StateRefType } from '../VestRuntime';

describe('Reconciler: Transient Isolates', () => {
  function withRunTime<T>(stateRef: StateRefType, fn: CB<T>) {
    return VestRuntime.Run(stateRef, () => {
      return fn();
    });
  }

  function createHistory(fn: CB): any {
    const tempRef = VestRuntime.createRef(
      (() => null) as unknown as IReconciler,
      v => v,
    );
    let root: any;
    withRunTime(tempRef, () => {
      root = fn();
    });
    return root;
  }

  it('should skip over transient nodes in history when finding a match', () => {
    // Create history: [Test A, Transient Skip, Test B]
    const historyRoot = createHistory(() =>
      Isolate.create('Root', () => {
        Isolate.create('Test', () => {}, {}, 'A');
        Isolate.create('Skip', () => {}, { transient: true });
        Isolate.create('Test', () => {}, {}, 'B');
      }),
    );

    const reconcilerSpy = vi.fn((_node: any, _history: any) => _node);
    const stateRef = VestRuntime.createRef(
      reconcilerSpy as unknown as IReconciler,
      v => v,
    );

    // Set history BEFORE Run so the context initializer picks it up
    const [, setHistory] = stateRef.historyRoot();
    setHistory(historyRoot);

    withRunTime(stateRef, () => {
      Isolate.create('Root', () => {
        const currentA = Isolate.create('Test', () => {}, {}, 'A');
        const currentB = Isolate.create('Test', () => {}, {}, 'B');

        const callA = reconcilerSpy.mock.calls.find(
          ([node]) => node === currentA,
        );
        expect(callA).toBeDefined();
        expect(callA![1]?.key).toBe('A');

        const callB = reconcilerSpy.mock.calls.find(
          ([node]) => node === currentB,
        );
        expect(callB).toBeDefined();
        expect(callB![1]?.key).toBe('B');
      });
    });
  });

  it('should insert transient nodes without consuming history', () => {
    // History: [Test A, Test B]
    const historyRoot = createHistory(() =>
      Isolate.create('Root', () => {
        Isolate.create('Test', () => {}, {}, 'A');
        Isolate.create('Test', () => {}, {}, 'B');
      }),
    );

    const reconcilerSpy = vi.fn((_node: any, _history: any) => _node);
    const stateRef = VestRuntime.createRef(
      reconcilerSpy as unknown as IReconciler,
      v => v,
    );
    const [, setHistory] = stateRef.historyRoot();
    setHistory(historyRoot);

    withRunTime(stateRef, () => {
      Isolate.create('Root', () => {
        const currentA = Isolate.create('Test', () => {}, {}, 'A');
        const currentTrans = Isolate.create('Skip', () => {}, {
          transient: true,
        });
        const currentB = Isolate.create('Test', () => {}, {}, 'B');

        const callA = reconcilerSpy.mock.calls.find(
          ([node]) => node === currentA,
        );
        expect(callA?.[1]?.key).toBe('A');

        // Transient nodes skip reconciler entirely
        const callTrans = reconcilerSpy.mock.calls.find(
          ([node]) => node === currentTrans,
        );
        expect(callTrans).toBeUndefined();

        const callB = reconcilerSpy.mock.calls.find(
          ([node]) => node === currentB,
        );
        expect(callB?.[1]?.key).toBe('B');
      });
    });
  });

  it('History [A, T, B], Current [A, B]: should match A->A, B->B', () => {
    const historyRoot = createHistory(() =>
      Isolate.create('Root', () => {
        Isolate.create('Test', () => {}, {}, 'A');
        Isolate.create('Skip', () => {}, { transient: true });
        Isolate.create('Test', () => {}, {}, 'B');
      }),
    );

    const reconcilerSpy = vi.fn((_node: any, _history: any) => _node);
    const stateRef = VestRuntime.createRef(
      reconcilerSpy as unknown as IReconciler,
      v => v,
    );
    const [, setHistory] = stateRef.historyRoot();
    setHistory(historyRoot);

    withRunTime(stateRef, () => {
      Isolate.create('Root', () => {
        const currentA = Isolate.create('Test', () => {}, {}, 'A');
        const currentB = Isolate.create('Test', () => {}, {}, 'B');

        expect(
          reconcilerSpy.mock.calls.find(([n]) => n === currentA)?.[1]?.key,
        ).toBe('A');
        expect(
          reconcilerSpy.mock.calls.find(([n]) => n === currentB)?.[1]?.key,
        ).toBe('B');
      });
    });
  });

  it('History [A, B], Current [A, T, B]: should match A->A, T->new, B->B', () => {
    const historyRoot = createHistory(() =>
      Isolate.create('Root', () => {
        Isolate.create('Test', () => {}, {}, 'A');
        Isolate.create('Test', () => {}, {}, 'B');
      }),
    );

    const reconcilerSpy = vi.fn((_node: any, _history: any) => _node);
    const stateRef = VestRuntime.createRef(
      reconcilerSpy as unknown as IReconciler,
      v => v,
    );
    const [, setHistory] = stateRef.historyRoot();
    setHistory(historyRoot);

    withRunTime(stateRef, () => {
      Isolate.create('Root', () => {
        const currentA = Isolate.create('Test', () => {}, {}, 'A');
        const currentTrans = Isolate.create('Skip', () => {}, {
          transient: true,
        });
        const currentB = Isolate.create('Test', () => {}, {}, 'B');

        expect(
          reconcilerSpy.mock.calls.find(([n]) => n === currentA)?.[1]?.key,
        ).toBe('A');
        expect(
          reconcilerSpy.mock.calls.find(([n]) => n === currentTrans),
        ).toBeUndefined();
        expect(
          reconcilerSpy.mock.calls.find(([n]) => n === currentB)?.[1]?.key,
        ).toBe('B');
      });
    });
  });
});
