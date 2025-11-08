import { describe, it, expect, beforeEach } from 'vitest';

import { createState } from 'vast';

let state = createState();

describe('vast state', () => {
  beforeEach(() => {
    state = createState();
  });

  describe('createState', () => {
    it('Should return all stateRef methods', () => {
      expect(state).toMatchInlineSnapshot(`
        {
          "registerStateKey": [Function],
          "reset": [Function],
        }
      `);
    });
  });

  describe('state.registerStateKey', () => {
    it('Should return a function', () => {
      expect(typeof state.registerStateKey()).toBe('function');
    });

    it('Should append another state key on each call', () => {
      const stateValues = Array.from({ length: 100 }, () => Math.random());
      const stateGetters = stateValues.map(value =>
        state.registerStateKey(value),
      );
      expect(
        stateGetters.every(
          (stateGetter, i) => stateGetter()[0] === stateValues[i],
        ),
      ).toBe(true);
      expect(stateGetters).toHaveLength(100);
    });

    describe('When initial value is a function', () => {
      it('Should generate initial state from key', () => {
        const initialStateKey = { key: 'value' };
        const stateGetter = state.registerStateKey(() => initialStateKey);
        expect(stateGetter()[0]).toBe(initialStateKey);
      });
    });

    describe('When initial value is not a function', () => {
      it('Should use provided value as initial state', () => {
        const stateValue = { key: 'value' };
        const stateGetter = state.registerStateKey(stateValue);
        expect(stateGetter()[0]).toBe(stateValue);
      });
    });

    describe('When initial value is not provided', () => {
      it('Should set initial state to undefined', () => {
        const stateGetter = state.registerStateKey();
        expect(stateGetter()[0]).toBeUndefined();
      });
    });
  });

  describe('State key function', () => {
    it('Should return an Array with two elements', () => {
      expect(state.registerStateKey()()).toHaveLength(2);
      expect(state.registerStateKey('some value')()).toMatchInlineSnapshot(`
        [
          "some value",
          [Function],
        ]
      `);
    });

    describe('getting current value', () => {
      it('Should have current value in the first array element', () => {
        const stateGetter = state.registerStateKey('Some Value');
        expect(stateGetter()[0]).toBe('Some Value');
      });
    });

    describe('updating the state', () => {
      it('Should contain state updater in the second array element', () => {
        const stateGetter = state.registerStateKey('Some Value');
        expect(typeof stateGetter()[1]).toBe('function');
      });

      it('Should update the state with provided value', () => {
        const stateGetter = state.registerStateKey({ key: 'first-value' });
        const [, valueSetter] = stateGetter();
        const nextValue = { key: 'second-value' };
        valueSetter(nextValue);
        expect(stateGetter()[0]).toBe(nextValue);
      });

      describe('When passing a function', () => {
        it('Should update the state with the result of the function', () => {
          const stateGetter = state.registerStateKey({ key: 'first-value' });
          const [, valueSetter] = stateGetter();
          const nextValue = { key: 'second-value' };
          valueSetter(() => nextValue);
          expect(stateGetter()[0]).toBe(nextValue);
        });

        it('Should pass the function the current state value', () => {
          return new Promise<void>(done => {
            const stateGetter = state.registerStateKey('555');
            const [currentState, valueSetter] = stateGetter();
            expect(currentState).toBe('555');

            valueSetter(prevState => {
              expect(prevState).toBe('555');
              done();
              return prevState;
            });
          });
        });
      });
    });
  });

  describe('onStateChange and onUpdate handlers', () => {
    it('Should run onStateChange handler when updating the state', () => {
      const onStateChange = vi.fn();
      state = createState(onStateChange);

      const useKey1 = state.registerStateKey('v1');
      const useKey2 = state.registerStateKey('v2');
      expect(onStateChange).toHaveBeenCalledTimes(2);
      useKey1()[1]('v1_1');
      expect(onStateChange).toHaveBeenCalledTimes(3);
      useKey2()[1]('v2_1');
      expect(onStateChange).toHaveBeenCalledTimes(4);
      expect(onStateChange).toHaveBeenCalledWith();
    });

    it('Should run onUpdate handler when updating the key', () => {
      const onUpdate1 = vi.fn();
      const onUpdate2 = vi.fn();
      state = createState();

      const useKey1 = state.registerStateKey('v1', onUpdate1);
      const useKey2 = state.registerStateKey('v2', onUpdate2);
      expect(onUpdate1).toHaveBeenCalledTimes(1);
      expect(onUpdate1).toHaveBeenCalledWith('v1', undefined);
      expect(onUpdate2).toHaveBeenCalledTimes(1);
      const [, setKey1] = useKey1();
      const [, setKey2] = useKey2();
      setKey1('v1_1');
      expect(onUpdate1).toHaveBeenCalledTimes(2);

      // pass current state + previous state
      expect(onUpdate1).toHaveBeenCalledWith('v1_1', 'v1');
      setKey1('v1_2');
      expect(onUpdate1).toHaveBeenCalledWith('v1_2', 'v1_1');
      expect(onUpdate2).toHaveBeenCalledTimes(1);
      setKey2('v2_1');
      expect(onUpdate2).toHaveBeenCalledTimes(2);
      expect(onUpdate2).toHaveBeenCalledWith('v2_1', 'v2');
    });

    it('Should first run onUpdate and then onStateChange', () => {
      const onUpdate = vi.fn();
      const onChange = vi.fn();
      state = createState(onChange);

      state.registerStateKey('v1', onUpdate);
      expect(onUpdate.mock.invocationCallOrder[0]).toBeLessThan(
        onChange.mock.invocationCallOrder[0],
      );
    });
  });

  describe('state.reset', () => {
    it('Should fill up the state with registered keys', () => {
      const s1 = state.registerStateKey(111);
      const s2 = state.registerStateKey(222);
      const s3 = state.registerStateKey(333);
      const s4 = state.registerStateKey(444);
      s1()[1](555);
      s2()[1](666);
      s3()[1](777);
      s4()[1](888);

      // sanity
      expect(s1()[0]).toBe(555);
      expect(s2()[0]).toBe(666);
      expect(s3()[0]).toBe(777);
      expect(s4()[0]).toBe(888);

      state.reset();

      // testing now that everything is back to initial value
      expect(s1()[0]).toBe(111);
      expect(s2()[0]).toBe(222);
      expect(s3()[0]).toBe(333);
      expect(s4()[0]).toBe(444);
    });

    it('Should allow setting a value after a state reset', () => {
      const stateGetter = state.registerStateKey(() => 'hello!');
      const [, stateSetter] = stateGetter();
      state.reset();
      stateSetter('Good Bye!');
      expect(stateGetter()[0]).toBe('Good Bye!');
    });
  });
});
