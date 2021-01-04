import enforce from 'enforce';

describe('optional', () => {
  it('Should allow optional fields to not be defined', () => {
    expect(
      enforce.shape({
        user: enforce.isString(),
        password: enforce.optional(),
        confirm: enforce.optional(),
      })
    ).toPassWith({ user: 'example', confirm: 'example' });
  });

  it('Should allow optional fields to be undefined', () => {
    expect(
      enforce.shape({
        user: enforce.isString(),
        confirm: enforce.optional(),
      })
    ).toPassWith({ user: 'example', confirm: undefined });
  });
  it('Should allow optional fields to be null', () => {
    expect(
      enforce.shape({
        user: enforce.isString(),
        confirm: enforce.optional(),
      })
    ).toPassWith({ user: 'example', confirm: null });
  });

  it('enforces rules on optional when value is defined', () => {
    expect(
      enforce.shape({
        nickname: enforce.optional(enforce.isString(), enforce.isNotNumeric()),
      })
    ).not.toPassWith({ nickname: '1111' });
  });
});
