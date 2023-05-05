import enforceEager from 'enforceEager';

describe(`enforce eager`, () => {
  it('should throw when rule fails', () => {
    expect(() => enforceEager([]).isString()).toThrow();
    expect(() => enforceEager(1).greaterThan(1)).toThrow();
    expect(() => enforceEager(1).greaterThan(1).lessThan(0)).toThrow();
  });

  it('Should return silently when rule passes', () => {
    enforceEager(1).isNumber();
    enforceEager(1).greaterThan(0);
    enforceEager(1).greaterThan(0).lessThan(10);
  });
});
