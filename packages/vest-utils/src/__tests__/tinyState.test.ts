import { createTinyState } from 'tinyState';

describe('tinyTest', () => {
  it('Should be a function', () => {
    expect(typeof createTinyState).toBe('function');
  });

  it('Should return a function', () => {
    expect(typeof createTinyState(1)).toBe('function');
  });

  it('Should return a function that returns an array', () => {
    expect(Array.isArray(createTinyState(1)())).toBe(true);
  });

  it('Should return a function that returns an array with two items', () => {
    expect(createTinyState(1)()).toHaveLength(2);
  });

  it('Should return a function that returns an array with two items, the first being the initial value', () => {
    expect(createTinyState('initial_value')()[0]).toBe('initial_value');

    const initialValue = {};
    expect(createTinyState(initialValue)()[0]).toBe(initialValue);
  });

  it('Should return a function that returns an array with two items, the second being a function', () => {
    expect(typeof createTinyState(1)()[1]).toBe('function');
  });

  it('Updates the value when the second item is called', () => {
    const testState = createTinyState('initial_value');

    {
      const [, setValue] = testState();
      setValue('new_value');
    }

    {
      const [value] = testState();
      expect(value).toBe('new_value');
    }
  });
});
