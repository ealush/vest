import {
  goodBooleanRule,
  goodObjectRule,
  goodObjectMessageRule,
  badObjectRule,
  nullRule,
  goodObjectMessageFunctionRule,
} from 'rulesTestUtils';
import {
  transformResult,
  getDefaultResult,
  validateResult,
} from 'transformResult';

describe('Tests `validateResult` helper', () => {
  it('Should pass with boolean return values', () => {
    const testRule = () => true;
    validateResult(testRule());
  });

  it('Should pass with a verbose return value', () => {
    const testRule = () => ({ pass: false, message: 'pass' });
    validateResult(testRule());
  });

  it('Should throw error when reciving null', () => {
    const testRule = () => null;
    expect(() => validateResult(testRule())).toThrow(Error);
  });

  it("Should return false if it is a verbose result and doesn't have pass property", () => {
    const missingPass = () => ({ message: 'missing pass' });
    expect(() => validateResult(missingPass())).toThrow(Error);
  });
});

describe.each([true, false])('Test transform result', bool => {
  // to make sure we don't end up leaving some hardcoded value behind
  it(`Should transform a boolean`, () => {
    const { message: expectedMessage } = getDefaultResult(
      bool,
      goodBooleanRule
    );
    const result = goodBooleanRule(bool);
    expect(
      transformResult(result, { rule: goodBooleanRule, value: bool })
    ).toEqual({ pass: bool, message: expectedMessage });
  });

  it('Should transform a complete object', () => {
    const result = goodObjectRule(bool);
    expect(
      transformResult(result, { rule: goodObjectRule, value: bool })
    ).toEqual({
      pass: bool,
      message: result.message,
    });
  });

  it('Should add default message', () => {
    const result = goodObjectMessageRule(bool);
    const { message: expectedMessage } = getDefaultResult(
      bool,
      goodObjectMessageRule
    );

    expect(
      transformResult(result, {
        rule: goodObjectMessageRule,
        value: bool,
      })
    ).toEqual({
      pass: bool,
      message: expectedMessage,
    });
  });

  it('Should get the message from the function', () => {
    const result = goodObjectMessageFunctionRule(bool);
    expect(
      transformResult(result, {
        rule: goodObjectMessageFunctionRule,
        value: bool,
      })
    ).toEqual({
      pass: bool,
      message: result.message(),
    });
  });

  it('Should throw with malformed result', () => {
    const result = badObjectRule(bool);
    expect(() =>
      transformResult(result, { rule: badObjectRule, value: bool })
    ).toThrow(Error);
  });

  it('Should throw with null result', () => {
    const result = nullRule(bool);
    expect(() =>
      transformResult(result, { rule: nullRule, value: bool })
    ).toThrow(Error);
  });
});
