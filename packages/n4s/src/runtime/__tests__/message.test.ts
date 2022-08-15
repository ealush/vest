import { enforce } from 'enforce';
import ruleReturn from 'ruleReturn';

describe('enforce..message()', () => {
  it('Should set the failure message in builtin rules', () => {
    expect(
      enforce.equals(false).message('oof. Expected true to be false').run(true)
    ).toEqual(ruleReturn(false, 'oof. Expected true to be false'));

    expect(
      enforce
        .equals(false)
        .message(() => 'oof. Expected true to be false')
        .run(true)
    ).toEqual(ruleReturn(false, 'oof. Expected true to be false'));
  });

  it('Should set the failure message in custom rules', () => {
    expect(
      enforce.ruleWithFailureMessage().message('oof. Failed again!').run(true)
    ).toEqual(ruleReturn(false, 'oof. Failed again!'));

    expect(
      enforce
        .ruleWithFailureMessage()
        .message(() => 'oof. Failed again!')
        .run(true)
    ).toEqual(ruleReturn(false, 'oof. Failed again!'));
  });

  describe('.message callback', () => {
    it('Should be passed the rule value as the first argument', () => {
      const msg = jest.fn(() => 'some message');
      const arg = {};
      expect(enforce.equals(false).message(msg).run(arg)).toEqual(
        ruleReturn(false, 'some message')
      );
      expect(msg).toHaveBeenCalledWith(arg, undefined);
    });

    it('Should pass original messages the second argument if exists', () => {
      const msg = jest.fn(() => 'some message');
      const arg = {};
      expect(
        enforce.ruleWithFailureMessage(false).message(msg).run(arg)
      ).toEqual(ruleReturn(false, 'some message'));
      expect(msg).toHaveBeenCalledWith(arg, 'This should not be seen!');
    });
  });
});

describe('enforce().message()', () => {
  it('should return message as a function', () => {
    expect(enforce(3).message).toBeInstanceOf(Function);
  });
  it('should return message after chainning', () => {
    expect(enforce(1).equals(1).message).toBeInstanceOf(Function);
  });

  it('Should throw a literal string', () => {
    let i;
    try {
      enforce(1).message('oogie booogie').equals(2);
    } catch (e) {
      i = e;
    }
    expect(i).toBe('oogie booogie');
  });

  it('should throw the message error on failure', () => {
    expect(() => {
      enforce('').message('octopus').equals('evyatar');
    }).toThrow('octopus');
  });
  it('should throw the message error on failure with the last message that failed', () => {
    expect(() => {
      enforce(10)
        .message('must be a number!')
        .isNumeric()
        .message('too high')
        .lessThan(8);
    }).toThrow('too high');
  });
});

enforce.extend({
  ruleWithFailureMessage: () => ({
    pass: false,
    message: 'This should not be seen!',
  }),
});
