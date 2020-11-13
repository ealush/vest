import { RUN_RULE } from 'enforceKeywords';
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

      it('Should retain all lazy functions in an array as a property of the returned object', () => {
        expect(enforce.isEmpty()[RUN_RULE]).toBeInstanceOf(Array);
        expect(enforce.isEmpty().isArray()[RUN_RULE]).toBeInstanceOf(Array);
      });

      it('Should store all the provided rules in the returned array', () => {
        const res = enforce.isEmpty().isArray().equals()[RUN_RULE];
        expect(res).toHaveLength(3);
        expect(res[0].name).toBe('isEmpty');
        expect(res[1].name).toBe('isArray');
        expect(res[2].name).toBe('equals');
        expect(typeof res[0]).toBe('function');
        expect(typeof res[1]).toBe('function');
        expect(typeof res[2]).toBe('function');
      });

      it('Should produce correct result when run', () => {
        expect(enforce.isEmpty()[RUN_RULE].every(fn => fn([]))).toBe(true);
        expect(enforce.isEmpty()[RUN_RULE].every(fn => fn([1, 2, 3]))).toBe(
          false
        );
        expect(enforce.isNumeric()[RUN_RULE].every(fn => fn('555'))).toBe(true);
        expect(enforce.greaterThan(10)[RUN_RULE].every(fn => fn(20))).toBe(
          true
        );
        expect(enforce.greaterThan(20)[RUN_RULE].every(fn => fn(10))).toBe(
          false
        );
        expect(enforce.greaterThan(10)[RUN_RULE].every(fn => fn(4))).toBe(
          false
        );
        const fn = jest.fn(() => true);
        enforce.extend({
          getArgs: fn,
        });
        enforce.getArgs(2, 3, 4, 5, 6, 7)[RUN_RULE].every(fn => fn(1));
        // // One should be first
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
