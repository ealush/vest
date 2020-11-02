import rules from 'rules';

const allRules = Object.keys(rules());
const _proxy = Proxy;

const suite = ({ withProxy, requirePath }) =>
  describe('Test enforce function', () => {
    let enforce;
    beforeAll(() => {
      jest.resetModules();

      if (!withProxy) {
        global.Proxy = undefined;
        delete global.Proxy;
      }
      enforce = require(requirePath);
    });

    afterAll(() => {
      global.Proxy = _proxy;
    });

    describe('Rules object', () => {
      it('Should expose rules as functions', () => {
        const en = enforce();
        allRules.forEach(rule => expect(en[rule]).toBeInstanceOf(Function));
      });

      it('Should predictably return rule object with same rules', () => {
        expect(Object.keys(enforce())).toEqual(Object.keys(enforce()));
      });

      it('Should return same rules object after every rule call', () => {
        let en;

        en = enforce(1);
        expect(en.isNumber()).toBe(en.isNumeric());
        expect(en.isNumber()).toBe(en);
        en = enforce('1');
        expect(en.isString()).toBe(en.isNotEmpty());
        expect(en.isString()).toBe(en);
        en = enforce([]);
        expect(en.isArray()).toBe(en.lengthEquals(0));
        expect(en.isArray()).toBe(en);
      });
    });

    describe('Test custom rule extensions', () => {
      let extended;
      beforeEach(() => {
        extended = enforce.extend({
          endsWith: (v, arg) => v.endsWith(arg),
          isImpossible: v => !!v.match(/impossible/i),
          passVerbose: () => ({
            pass: true,
            message: "It shouldn't throw an error",
          }),
          throwVerbose: () => ({ pass: false, message: 'Custom error' }),
        });
      });

      it('Should return enforce', () => {
        expect(typeof extended).toBe('function');
        expect(extended).toBe(enforce);
      });

      it('Should throw on failing custom rule in regular test', () => {
        const t = () => enforce('The name is Snowball').endsWith('Snuffles');
        expect(t).toThrow(Error);
      });

      it('Should return silently for custom rule in regular test', () => {
        enforce('Impossible! The name is Snowball')
          .endsWith('Snowball')
          .isImpossible();
      });

      it('Should return silently for custom verbose rule in regular test', () => {
        enforce().passVerbose();
      });
    });

    describe('lazy enforcements', () => {
      it('Should expose all rules on top of the enforce function', () => {
        allRules.forEach(rule => expect(typeof enforce[rule]).toBe('function'));

        expect(enforce.isAbc).toBeUndefined();
        enforce.extend({ isAbc: v => v === 'abc' });
        expect(typeof enforce.isAbc).toBe('function');
      });

      test('Each rule returns a function', () => {
        allRules.forEach(rule =>
          expect(typeof enforce[rule]()).toBe('function')
        );
      });

      test('Returned function returns a boolean value', () => {
        expect(enforce.isArray()([])).toBe(true);
        expect(enforce.isNumber()('not_a_number')).toBe(false);
      });

      it("Should use the second function's argument as the enforce value, and the first function's arguments as the ...rest", () => {
        expect(enforce.isEmpty()([])).toBe(true);
        expect(enforce.isEmpty()([1, 2, 3])).toBe(false);
        expect(enforce.isNumeric()('555')).toBe(true);
        expect(enforce.greaterThan(10)(20)).toBe(true);
        expect(enforce.greaterThan(10)(4)).toBe(false);

        const fn = jest.fn(() => true);

        enforce.extend({
          getArgs: fn,
        });

        enforce.getArgs(2, 3, 4, 5, 6, 7)(1);
        // One should be first
        expect(fn).toHaveBeenCalledWith(1, 2, 3, 4, 5, 6, 7);
      });
    });

    it('Should throw errors on failing enforces', () => {
      const isNumber = () => enforce('a').isNumber(true);
      expect(isNumber).toThrow(Error);
    });
  });

['enforce', '../../../dist/n4s'].forEach(requirePath => {
  jest.resetModules();

  suite({ withProxy: true, requirePath });
  suite({ withProxy: false, requirePath });
});
