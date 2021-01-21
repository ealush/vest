import enforce from 'enforce';

describe('enforce.extend', () => {
  let extended;
  beforeEach(() => {
    extended = enforce.extend({
      endsWith: (v, arg) => v.endsWith(arg),
      failsWithFunction: () => ({
        pass: false,
        message: () => 'Custom error with function',
      }),
      isImpossible: v => !!v.match(/impossible/i),
      passVerbose: () => ({
        pass: true,
        message: "It shouldn't throw an error",
      }),
      throwVerbose: () => ({ pass: false, message: 'Custom error' }),
    });
  });

  it('Should return enforce', () => {
    expect(typeof extended).toBe('function');
    expect(extended).toBe(enforce);
  });

  it('Should throw on failing custom rule in regular test', () => {
    const t = () => enforce('The name is Snowball').endsWith('Snuffles');
    expect(t).toThrow();
  });

  it('Should return silently for custom rule in regular test', () => {
    enforce('Impossible! The name is Snowball')
      .endsWith('Snowball')
      .isImpossible();
  });

  it('Should return silently for custom verbose rule in regular test', () => {
    enforce().passVerbose();
  });

  it('Should use message from returned function result', () => {
    expect(() => enforce('').failsWithFunction(2)).toThrow(
      'Custom error with function'
    );
  });
});
