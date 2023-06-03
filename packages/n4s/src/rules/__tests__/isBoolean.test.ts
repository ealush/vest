import { enforce } from 'enforce';

describe('isBoolean', () => {
  it('Should pass for a boolean value', () => {
    enforce(true).isBoolean();
    enforce(false).isBoolean();
  });

  it('Should fail for a non boolean value', () => {
    expect(() => enforce('true').isBoolean()).toThrow();
  });
});

describe('isNotBoolean', () => {
  it('Should pass for a non boolean value', () => {
    enforce('true').isNotBoolean();
    enforce([false]).isNotBoolean();
  });

  it('Should fail for a boolean value', () => {
    expect(() => enforce(true).isNotBoolean()).toThrow();
  });
});
