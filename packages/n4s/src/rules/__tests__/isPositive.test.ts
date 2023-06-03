import { enforce } from 'n4s';

describe('Test isPositive rule', () => {
  it('Shiuld fail for non-numeric values', () => {
    expect(() => enforce(false).isPositive()).toThrow();
    expect(() => enforce([]).isPositive()).toThrow();
    expect(() => enforce({}).isPositive()).toThrow();
  });

  it('Should fail for negative values', () => {
    expect(() => enforce(-1).isPositive()).toThrow();
    expect(() => enforce(-1.1).isPositive()).toThrow();
    expect(() => enforce('-1').isPositive()).toThrow();
    expect(() => enforce('-1.10').isPositive()).toThrow();
  });

  it('Should pass for positive values', () => {
    enforce(10).isPositive();
    enforce(10.1).isPositive();
    enforce('10').isPositive();
    enforce('10.10').isPositive();
  });

  it('Should fail for zero', () => {
    expect(() => enforce(0).isPositive()).toThrow();
  });
});
