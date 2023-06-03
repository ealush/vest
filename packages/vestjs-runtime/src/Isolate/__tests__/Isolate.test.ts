import { Isolate } from 'Isolate';
import { StateRefType, useAvailableRoot } from 'VestRuntime';
import { VestRuntime } from 'vestjs-runtime';

describe('Isolate', () => {
  let stateRef: StateRefType;

  beforeEach(() => {
    stateRef = VestRuntime.createRef({});
  });

  describe('Isolate.create', () => {
    it('should return an instance of Isolate', () => {
      const isolate = withRunTime(() => {
        return Isolate.create(() => {});
      });
      expect(isolate).toBeInstanceOf(Isolate);
    });

    it('Should run the passed callback', () => {
      const spy = jest.fn();
      withRunTime(() => {
        Isolate.create(spy);
      });
      expect(spy).toHaveBeenCalled();
    });

    it('Should store the callback result in the output property', () => {
      const isolate = withRunTime(() => {
        return Isolate.create(() => {
          return 'foo';
        });
      });
      expect(isolate.output).toBe('foo');
    });

    describe('When there is no parent', () => {
      it('Parent should be null', () => {
        const isolate = withRunTime(() => {
          return Isolate.create(() => {});
        });
        expect(isolate.parent).toBeNull();
      });

      it('Should set the history root to the current isolate', () => {
        const isolate = withRunTime(() => {
          const isolate = Isolate.create(() => {});

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
          const children = [] as Isolate[];
          const parent = Isolate.create(() => {
            children.push(Isolate.create(() => {}));
            children.push(Isolate.create(() => {}));
            children.push(Isolate.create(() => {}));
            children.push(Isolate.create(() => {}));
          });
          return [parent, children];
        });
        expect(parent.children).toEqual(children);
      });

      it('Should set the parent property', () => {
        const [parent, child] = withRunTime(() => {
          let child = {} as Isolate;
          const parent = Isolate.create(() => {
            child = Isolate.create(() => {});
          });

          return [parent, child];
        });
        expect(child.parent).toBe(parent);
      });
    });
  });

  function withRunTime<T>(fn: () => T) {
    return VestRuntime.Run(stateRef, () => {
      return fn();
    });
  }
});
