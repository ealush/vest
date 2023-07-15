import { CB } from 'vest-utils';

import { TIsolate, Isolate } from 'Isolate';
import { StateRefType, useAvailableRoot } from 'VestRuntime';
import { VestRuntime } from 'vestjs-runtime';

enum IsolateType {
  Isolate = 'Isolate',
  Child = 'Child',
}

describe('Isolate', () => {
  let stateRef: StateRefType;

  beforeEach(() => {
    stateRef = VestRuntime.createRef({});
  });

  describe('Isolate.create', () => {
    it('should return an instance of Isolate', () => {
      const isolate = withRunTime(() => {
        return Isolate.create(IsolateType.Isolate, () => {});
      });
      expect(isolate).toBeInstanceOf(Object);
    });

    it('Should run the passed callback', () => {
      const spy = jest.fn();
      withRunTime(() => {
        Isolate.create(IsolateType.Isolate, spy);
      });
      expect(spy).toHaveBeenCalled();
    });

    it('Should store the callback result in the output property', () => {
      const isolate = withRunTime(() => {
        return Isolate.create(IsolateType.Isolate, () => {
          return 'foo';
        });
      });
      expect(isolate.output).toBe('foo');
    });

    describe('When there is no parent', () => {
      it('Parent should be null', () => {
        const isolate = withRunTime(() => {
          return Isolate.create(IsolateType.Isolate, () => {});
        });
        expect(isolate.parent).toBeNull();
      });

      it('Should set the history root to the current isolate', () => {
        const isolate = withRunTime(() => {
          const isolate = Isolate.create(IsolateType.Isolate, () => {});

          expect(useAvailableRoot()).toBe(isolate);

          return isolate;
        });
        // Just verifying that we did not throw and catch inside the runtime
        expect(isolate).toBeDefined();
      });
    });

    describe('When there is a parent', () => {
      it('Should add the isolate to the parent children', () => {
        const [parent, children] = withRunTime(() => {
          const children = [] as TIsolate[];
          const parent = Isolate.create(IsolateType.Isolate, () => {
            children.push(Isolate.create(IsolateType.Child, () => {}));
            children.push(Isolate.create(IsolateType.Child, () => {}));
            children.push(Isolate.create(IsolateType.Child, () => {}));
            children.push(Isolate.create(IsolateType.Child, () => {}));
          });
          return [parent, children];
        });
        expect(parent.children).toEqual(children);
      });

      it('Should set the parent property', () => {
        const [parent, child] = withRunTime(() => {
          let child = {} as TIsolate;
          const parent = Isolate.create(IsolateType.Isolate, () => {
            child = Isolate.create(IsolateType.Child, () => null);
          });

          return [parent, child];
        });
        expect(child.parent).toBe(parent);
      });
    });
  });

  function withRunTime<T>(fn: CB<T>) {
    return VestRuntime.Run(stateRef, () => {
      return fn();
    });
  }
});
