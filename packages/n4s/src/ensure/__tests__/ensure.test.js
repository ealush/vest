import { sample } from 'lodash';

import rules from 'rules';

const allRules = Object.keys(rules());
const _proxy = Proxy;

const suite = ({ withProxy, requirePath }) =>
  describe('Test ensure function', () => {
    let ensure;
    beforeAll(() => {
      jest.resetModules();
      if (!withProxy) {
        global.Proxy = undefined;
        delete global.Proxy;
      }
      ensure = require(requirePath);
    });

    afterAll(() => {
      global.Proxy = _proxy;
    });

    describe('.test() function', () => {
      describe('When validation succeeds', () => {
        it('Should return true', () => {
          expect(
            [
              ensure().inside([1, 2, 3]).test(1),
              ensure().isNumber().test(1),
              ensure().isArray().test([1]),
              ensure().greaterThan(5).test(10),
              ensure().greaterThan(5).lt(100).test(10),
            ].every(res => !!res)
          ).toBe(true);
        });
      });

      describe('When validation fails', () => {
        it('Should return false', () => {
          expect(
            [
              ensure().inside([1, 2, 3]).test(10),
              ensure().isNumber().test('1'),
              ensure().isArray().test(1),
              ensure().greaterThan(5).test(2),
              ensure().greaterThan(5).lt(100).test(101),
            ].every(res => !res)
          ).toBe(true);
        });
      });
    });

    describe('Rules object', () => {
      it('Should expose rules as functions', () => {
        const en = ensure();
        allRules.forEach(rule => expect(en[rule]).toBeInstanceOf(Function));
      });

      it('Should expose `test` function', () => {
        expect(
          ensure()[sample(allRules)]()[sample(allRules)]().test
        ).toBeInstanceOf(Function);
      });

      it('Should predictably return rule object with same rules', () => {
        expect(Object.keys(ensure())).toEqual(Object.keys(ensure()));
      });

      it('Should return same rules object after every rule call', () => {
        let en;
        en = ensure();
        expect(en[sample(allRules)]()).toBe(en[sample(allRules)]());
        expect(en[sample(allRules)]()).toBe(en);
        en = ensure();
        expect(en[sample(allRules)]()).toBe(en[sample(allRules)]());
        expect(en[sample(allRules)]()).toBe(en);
      });
    });
  });

['ensure', '../../../dist/ensure'].forEach(requirePath => {
  suite({ withProxy: true, requirePath });
  suite({ withProxy: false, requirePath });
});
