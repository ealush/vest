import throwError from 'throwError';

const message = 'message string';

describe('throwError', () => {
  it('Should throw with passed message', () => {
    expect(() => throwError(message)).toThrow(message);
  });

  it('Should throw provided error type', () => {
    expect(() => throwError(message, TypeError)).toThrow(TypeError);
  });
});
