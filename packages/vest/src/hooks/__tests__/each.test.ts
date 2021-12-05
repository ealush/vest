import * as vest from 'vest';

describe('each', () => {
  describe('When callback is not a function', () => {
    it('should throw', () => {
      const control = jest.fn();
      const suite = vest.create(() => {
        expect(() => {
          // @ts-expect-error
          vest.each([null], null);
        }).toThrowErrorMatchingSnapshot();
        control();
      });

      suite();
      expect(control).toHaveBeenCalledTimes(1);
    });
  });

  it('Should pass to callback the current list item and index', () => {
    const cb = jest.fn();
    const suite = vest.create(() => {
      vest.each([1, 2, 3, 'str'], cb);
    });

    suite();

    expect(cb).toHaveBeenCalledTimes(4);

    expect(cb).toHaveBeenNthCalledWith(1, 1, 0);
    expect(cb).toHaveBeenNthCalledWith(2, 2, 1);
    expect(cb).toHaveBeenNthCalledWith(3, 3, 2);
    expect(cb).toHaveBeenNthCalledWith(4, 'str', 3);
  });
});
