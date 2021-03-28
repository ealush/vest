import createState from 'state';

let state;

describe('state', () => {
  beforeEach(() => {
    state = createState();
  });

  describe('createState', () => {
    it('Should return all stateRef methods', () => {
      expect(state).toMatchInlineSnapshot(`
        Object {
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
        state.registerStateKey(value)
      );
      expect(
        stateGetters.every(
          (stateGetter, i) => stateGetter()[0] === stateValues[i]
        )
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
        Array [
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
        const stateGetter = state.registerStateKey('Some Value');
        const [, valueSetter] = stateGetter();
        const nextValue = { key: 'value' };
        valueSetter(nextValue);
        expect(stateGetter()[0]).toBe(nextValue);
      });
      describe('When passing a function', () => {
        it('Should update the state with the result of the function', () => {
          const stateGetter = state.registerStateKey('Some Value');
          const [, valueSetter] = stateGetter();
          const nextValue = { key: 'value' };
          valueSetter(() => nextValue);
          expect(stateGetter()[0]).toBe(nextValue);
        });
        it('Should pass the function the current state value', () => {
          const setter = jest.fn(() => 100);
          const stateGetter = state.registerStateKey('555');
          const [, valueSetter] = stateGetter();
          valueSetter(setter);
          expect(setter).toHaveBeenCalledWith('555');
        });
      });
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
