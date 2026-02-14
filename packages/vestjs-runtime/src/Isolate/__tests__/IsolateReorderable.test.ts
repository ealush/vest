import { CB } from 'vest-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { IsolateReorderable } from '../IsolateReorderable';
import { IsolateInspector } from '../IsolateInspector';
import { IsolateKeys } from '../IsolateKeys';
import { VestRuntime, IReconciler, Isolate } from '../../vestjs-runtime';

describe('IsolateReorderable', () => {
  let stateRef: any;
  // Mock reconciler to test reordering enforcement
  const testReconciler = vi.fn((currentNode: any, historyNode: any) => {
    // Simple check: if keys don't match, verify if reorder is allowed
    if (currentNode.key !== historyNode.key) {
      if (!IsolateInspector.canReorder(currentNode)) {
        throw new Error('Reorder violation');
      }
    }
    return currentNode;
  });

  beforeEach(() => {
    testReconciler.mockClear();
    stateRef = VestRuntime.createRef(
      testReconciler as unknown as IReconciler,
      v => v,
    );
  });

  function withRunTime<T>(fn: CB<T>) {
    return VestRuntime.Run(stateRef, () => {
      return fn();
    });
  }

  it('Should return an isolate with allowReorder set to true', () => {
    const isolate = withRunTime(() => IsolateReorderable(() => {}));
    expect(isolate[IsolateKeys.AllowReorder]).toBe(true);
  });

  it('Should set the type to "Reorderable" by default', () => {
    const isolate = withRunTime(() => IsolateReorderable(() => {}));
    expect(isolate[IsolateKeys.Type]).toBe('Reorderable');
  });

  it('Should allow overriding the type', () => {
    const isolate = withRunTime(() =>
      IsolateReorderable(() => {}, 'CustomType'),
    );
    expect(isolate[IsolateKeys.Type]).toBe('CustomType');
  });

  it('Should set the payload', () => {
    const payload = { foo: 'bar' };
    const isolate = withRunTime(() =>
      IsolateReorderable(() => {}, 'Type', payload),
    );
    expect(isolate[IsolateKeys.Data]).toMatchObject(payload);
  });

  it('Should run the callback', () => {
    const spy = vi.fn();
    withRunTime(() => IsolateReorderable(spy));
    expect(spy).toHaveBeenCalled();
  });

  describe('Reordering', () => {
    describe('When the isolate is reorderable', () => {
      it('Should allow reordering', () => {
        withRunTime(() => {
          IsolateReorderable(() => {
            Isolate.create('Child', () => {}, {}, 'A');
            Isolate.create('Child', () => {}, {}, 'B');
          });
        });

        expect(() => {
          withRunTime(() => {
            IsolateReorderable(() => {
              // Swapped order
              Isolate.create('Child', () => {}, {}, 'B');
              Isolate.create('Child', () => {}, {}, 'A');
            });
          });
        }).not.toThrow();
      });
    });

    describe('Sanity (Failure case)', () => {
      it('Should NOT allow reordering when parent is not Reorderable', () => {
        withRunTime(() => {
          // Standard Isolate does not allow reordering
          Isolate.create('Parent', () => {
            Isolate.create('Child', () => {}, {}, 'A');
            Isolate.create('Child', () => {}, {}, 'B');
          });
        });

        expect(() => {
          withRunTime(() => {
            Isolate.create('Parent', () => {
              // Swapped order
              Isolate.create('Child', () => {}, {}, 'B');
              Isolate.create('Child', () => {}, {}, 'A');
            });
          });
        }).toThrow('Reorder violation');
      });
    });
  });
});
