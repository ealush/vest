import context from '../context';
import state from '.';

let stateRef, useExampleState;
it.ctx = (str, cb) => it(str, () => context.run({ stateRef }, cb));

describe('state', () => {
  beforeEach(() => {
    useExampleState = state.registerHandler(() => 'I am an example!');

    stateRef = state.createRef({
      dynamicallyProvided: [state.registerHandler((a, b) => [a, b]), [1, 2]],
      exampleState: useExampleState,
      explicitValue: state.registerHandler(42),
      keyWithObject: state.registerHandler(() => ({ a: true })),
    });
  });
  describe('state initialization', () => {
    it('Should initialize state with provided keys', () => {
      expect(stateRef.current()).toEqual(initialState);
    });

    it('Shoult initialize without a previous state', () => {
      expect(stateRef.prev()).toBeUndefined();
    });
  });

  describe('State reset', () => {
    it.ctx('Should return state to its initial value', () => {
      stateRef.unshift();

      useExampleState(() => 'example_2');

      expect(stateRef.current()).toEqual({
        ...initialState,
        exampleState: 'example_2',
      });
      expect(stateRef.prev()).toEqual(initialState);

      stateRef.reset();
      expect(stateRef.current()).toEqual(initialState);
      expect(stateRef.prev()).toBeUndefined();
    });
  });

  describe('unshift', () => {
    it.ctx('Should move current state to `prev`', () => {
      useExampleState(() => ({ example: true }));
      const current = stateRef.current();

      stateRef.unshift();

      expect(stateRef.prev()).toBe(current);
      expect(stateRef.prev()).toEqual({
        ...initialState,
        exampleState: { example: true },
      });
    });

    it.ctx('Should set `current` to initial value', () => {
      useExampleState(() => ({ example: true }));
      const current = stateRef.current();

      stateRef.unshift();
      expect(stateRef.current()).not.toBe(current);
      expect(stateRef.current()).toEqual(initialState);
    });
  });

  describe('useHook', () => {
    describe('When passing a callback to the useHook function', () => {
      it.ctx('Updates the state', () => {
        useExampleState(() => 'I am the new value of the state!');

        expect(stateRef.current().exampleState).toBe(
          'I am the new value of the state!'
        );
      });
    });

    describe('useHook return value', () => {
      it.ctx('returns an array', () => {
        expect(Array.isArray(useExampleState())).toBe(true);
        expect(Array.isArray(useExampleState(() => null))).toBe(true);
        expect(useExampleState()).toHaveLength(2);
      });

      describe('pos:0', () => {
        it.ctx('Has the current value', () => {
          expect(useExampleState()[0]).toBe('I am an example!');
          expect(useExampleState(() => 'me too!')[0]).toBe('me too!');
          expect(useExampleState()[0]).toBe(stateRef.current().exampleState);
        });
      });

      describe('pos:1', () => {
        it.ctx('Has a function', () => {
          expect(typeof useExampleState()[1]).toBe('function');
        });

        it.ctx('Updates the state', () => {
          const [value, setValue] = useExampleState();
          setValue('an array of words'.split(' '));
          expect(useExampleState()[0]).toEqual(['an', 'array', 'of', 'words']);
          expect(useExampleState()[0]).not.toEqual(value);
          expect(stateRef.current().exampleState).toEqual([
            'an',
            'array',
            'of',
            'words',
          ]);
          setValue(() => ' a function works too!');
          expect(stateRef.current().exampleState).toEqual(
            ' a function works too!'
          );
          expect(stateRef.current().exampleState).toEqual(useExampleState()[0]);
        });
      });
    });
  });
});

const initialState = {
  dynamicallyProvided: [1, 2],
  exampleState: 'I am an example!',
  explicitValue: 42,
  keyWithObject: { a: true },
};
