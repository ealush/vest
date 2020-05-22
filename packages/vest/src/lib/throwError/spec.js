const throwError = require('.');

const message = 'message string';

describe('throwError', () => {
  it('Should throw with passed message', () => {
    expect(() => throwError(message)).toThrow(`[Vest]: ${message}`);
  });

  it('Should throw provided error type', () => {
    expect(() => throwError(message, TypeError)).toThrow(TypeError);
  });
});
