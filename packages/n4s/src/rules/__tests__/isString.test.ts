import { enforce } from 'n4s';

describe('Tests isString rule', () => {
  it('Should fail for non-string values', () => {
    expect(() => enforce(42).isString()).toThrow();
    expect(() => enforce([]).isString()).toThrow();
  });

  it('Should pass for string values', () => {
    enforce('I love you').isString();
  });
});
