import enforce from 'enforce';
import runtimeRules from 'runtimeRules';

describe('enforce.template', () => {
  test('enforce has `template` static function', () => {
    expect(typeof enforce.template).toBe('function');
  });

  describe('Return value', () => {
    it('Should return a function', () => {
      const x = enforce.template(enforce.isArray(), enforce.longerThan(5));

      expect(typeof x).toBe('function');
    });

    it('Should have a static function called `test`', () => {
      const x = enforce.template(enforce.isArray(), enforce.longerThan(5));

      expect(typeof x.test).toBe('function');
    });
  });

  describe('When the returned function gets called', () => {
    it('Should throw an error when invalid', () => {
      const x = enforce.template(enforce.isArray(), enforce.longerThan(2));
      const y = enforce.template(enforce.isString(), enforce.isNumeric());
      expect(() => x([])).toThrow();
      expect(() => y('')).toThrow();
      expect(() => x([1])).toThrow();
      expect(() => x('hello')).toThrow();
      expect(() => y('hello')).toThrow();
    });

    it('Should return silently when valid', () => {
      const x = enforce.template(enforce.isArray(), enforce.longerThan(2));
      const y = enforce.template(enforce.isString(), enforce.isNumeric());

      x([1, 2, 3]);
      y('123');
    });

    it('Should return rules proxy', () => {
      const x = enforce.template(enforce.isArray());
      expect(x([])).toEqual(enforce(1));
      Object.keys(runtimeRules).forEach(k => {
        expect(typeof x([])[k]).toBe('function');
      });
    });
  });

  describe('When the `test` function gets called', () => {
    it('Should return `false` when invalid', () => {
      const x = enforce.template(enforce.isNumber().greaterThan(50));
      const y = enforce.template(
        enforce.isString().isNumeric(),
        enforce.isOdd()
      );

      expect(x.test(10)).toBe(false);
      expect(x.test('90')).toBe(false);
      expect(y.test(true)).toBe(false);
      expect(x.test('90')).toBe(false);
    });
    it('Should return `true` when valid', () => {
      const x = enforce.template(enforce.isNumber().greaterThan(50));
      const y = enforce.template(
        enforce.isString().isNumeric(),
        enforce.isOdd()
      );

      expect(x.test(51)).toBe(true);
      expect(y.test('11')).toBe(true);
    });
  });

  describe('Nested templates', () => {
    it('Should validate all joined templates', () => {
      const X = enforce.template(enforce.isString(), enforce.longerThan(2));
      const Y = enforce.template(enforce.isNumeric());
      const Z = enforce.template(enforce.isEven());

      expect(() => enforce.template(X, Y, Z)('a')).toThrow();
      expect(() => enforce.template(X, Y, Z)('abc')).toThrow();
      expect(() => enforce.template(X, Y, Z)('111')).toThrow();
      expect(() => enforce.template(X, Y, Z)(112)).toThrow();
      enforce.template(X, Y, Z)('112');
      enforce.template(X, Y)('111');
      enforce.template(X)('abc');
    });
  });
});
