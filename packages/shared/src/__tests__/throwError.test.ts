import throwError from 'throwError';

const message = 'message string';

const dev = global.__DEV__;

describe('throwError', () => {
  afterEach(() => {
    // reset dev mode after each test
    global.__DEV__ = dev;
  });

  it('Should throw with passed message', () => {
    expect(() => throwError(message)).toThrow(message);
  });

  describe('When production message passed in dev mode', () => {
    it('Should throw with dev message', () => {
      global.__DEV__ = true;
      expect(() => throwError('dev message!', 'production message!')).toThrow(
        'dev message'
      );
    });
  });

  describe('When production message passed in prod mode', () => {
    it('Should throw with prod message', () => {
      global.__DEV__ = false;
      expect(() => throwError('dev message!', 'production message!')).toThrow(
        'production message!'
      );
    });
  });

  describe('When no production message passed in prod mode', () => {
    it('Should throw with dev message', () => {
      global.__DEV__ = false;
      expect(() => throwError('dev message!')).toThrow('dev message!');
    });
  });
});
