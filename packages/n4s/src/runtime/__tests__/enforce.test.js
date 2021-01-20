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
