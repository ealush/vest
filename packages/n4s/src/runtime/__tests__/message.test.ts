import enforce from 'enforce';
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

enforce.extend({
  ruleWithFailureMessage: () => ({
    pass: false,
    message: 'This should not be seen!',
  }),
});
