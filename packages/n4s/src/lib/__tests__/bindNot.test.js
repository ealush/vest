import bindNot from 'bindNot';

describe('bindNot', () => {
  it('Should return return a function', () => {
    expect(typeof bindNot(jest.fn())).toBe('function');
  });

  test('calling returned function runs accepted function', () => {
    const fn = jest.fn();

    expect(fn).not.toHaveBeenCalled();
    const not = bindNot(fn);
    expect(fn).not.toHaveBeenCalled();
    not();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('Should pass arguments to accepted function', () => {
    const fn = jest.fn();

    const not = bindNot(fn);
    not(1, 2, 3, 4);
    expect(fn).toHaveBeenCalledWith(1, 2, 3, 4);
  });

  it('Should return the boolean negation of the original function', () => {
    expect(bindNot(() => true)()).toBe(false);
    expect(bindNot(() => false)()).toBe(true);
    expect(bindNot(() => 'string')()).toBe(false);
    expect(bindNot(() => [])()).toBe(false);
    expect(bindNot(() => '')()).toBe(true);
    expect(bindNot(() => 0)()).toBe(true);
    expect(bindNot(() => NaN)()).toBe(true);
    expect(bindNot(() => null)()).toBe(true);
    expect(bindNot(() => undefined)()).toBe(true);
  });
});
