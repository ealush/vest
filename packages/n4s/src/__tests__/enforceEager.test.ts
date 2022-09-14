import { testVerifyProxy } from '../../testUtils/testVerifyProxy';

import { Enforce } from 'enforce';

testVerifyProxy((enforce: Enforce) => {
  it('should throw when rule fails', () => {
    expect(() => enforce([]).isString()).toThrow();
    expect(() => enforce(1).greaterThan(1)).toThrow();
    expect(() => enforce(1).greaterThan(1).lessThan(0)).toThrow();
  });

  it('Should return silently when rule passes', () => {
    enforce(1).isNumber();
    enforce(1).greaterThan(0);
    enforce(1).greaterThan(0).lessThan(10);
  });
});
