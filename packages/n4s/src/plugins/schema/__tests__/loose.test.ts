import { enforce } from 'enforce';
import * as ruleReturn from 'ruleReturn';
import 'schema';

describe('enforce.loose for loose matching', () => {
  describe('lazy interface', () => {
    it('Should return a passing return when value has non-enforced keys', () => {
      expect(
        enforce
          .loose({ username: enforce.isString(), age: enforce.isNumber() })
          .run({ username: 'ealush', age: 31, foo: 'bar' })
      ).toEqual(ruleReturn.passing());
    });
  });
  describe('eager interface', () => {
    it('Should return silently return when value has non-enforced keys', () => {
      enforce({ username: 'ealush', age: 31, foo: 'bar' }).loose({
        username: enforce.isString(),
        age: enforce.isNumber(),
      });
    });
  });
});
