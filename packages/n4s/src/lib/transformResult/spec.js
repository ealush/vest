import {
  goodBooleanRule,
  goodObjectRule,
  goodObjectMessageRule,
  badObjectRule,
  nullRule,
  goodObjectMessageFunctionRule,
} from '../../testUtils/rules';
import {
  isValidResult,
  transformResult,
  getDefaultResult,
  formatResultMessage,
  transformResultEnforce,
} from '.';

describe('Tests `isValidResult` helper', () => {
  it('Should return true with boolean return values', () => {
    const testRule = () => true;
    expect(isValidResult(testRule())).toBe(true);
  });

  it('Should return true with a verbose return value', () => {
    const testRule = () => ({ pass: false, message: 'pass' });
    expect(isValidResult(testRule())).toBe(true);
  });

  it('Should return false when reciving null', () => {
    const testRule = () => null;
    expect(isValidResult(testRule())).toBe(false);
  });

  it("Should return false if it is a verbose result and doesn't have pass property", () => {
    const missingPass = () => ({ message: 'missing pass' });
    expect(isValidResult(missingPass())).toBe(false);
  });
});

describe('Test transform result', () => {
  // to make sure we don't end up leaving some hardcoded value behind
  [true, false].forEach(bool => {
    it(`Should transform a boolean ${bool}`, () => {
      const { message: expectedMessage } = getDefaultResult(
        'Test',
        bool,
        goodBooleanRule
      );
      const result = goodBooleanRule(bool);
      expect(
        transformResult('Test', result, { rule: goodBooleanRule, value: bool })
      ).toEqual({ pass: bool, message: expectedMessage });
    });

    it('Should transform a complete object', () => {
      const result = goodObjectRule(bool);
      expect(
        transformResult('Test', result, { rule: goodObjectRule, value: bool })
      ).toEqual({
        pass: bool,
        message: formatResultMessage('Test', goodObjectRule, result.message),
      });
    });

    it('Should add default message', () => {
      const result = goodObjectMessageRule(bool);
      const { message: expectedMessage } = getDefaultResult(
        'Test',
        bool,
        goodObjectMessageRule
      );

      expect(
        transformResult('Test', result, {
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
        transformResult('Test', result, {
          rule: goodObjectMessageFunctionRule,
          value: bool,
        })
      ).toEqual({
        pass: bool,
        message: formatResultMessage(
          'Test',
          goodObjectMessageFunctionRule,
          result.message()
        ),
      });
    });

    it('Should throw with malformed result', () => {
      const result = badObjectRule(bool);
      expect(() =>
        transformResult('Test', result, { rule: badObjectRule, value: bool })
      ).toThrow(Error);
    });

    it('Should throw with null result', () => {
      const result = nullRule(bool);
      expect(() =>
        transformResult('Test', result, { rule: nullRule, value: bool })
      ).toThrow(Error);
    });
  });
});

describe("Test transform result's message", () => {
  [goodObjectMessageRule, goodObjectMessageRule, goodObjectRule].forEach(
    rule => {
      it('Should starts with [Enforce]', () => {
        const result = rule(true);
        expect(
          transformResultEnforce(result, { rule, value: true }).message
        ).toMatch(/^\[Enforce\]/);
      });

      it('Should contain the name of the rule', () => {
        const result = rule(true);
        expect(
          transformResultEnforce(result, { rule, value: true }).message
        ).toMatch(rule.name);
      });
    }
  );
});
