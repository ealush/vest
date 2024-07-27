import { invariant } from 'vest-utils';

describe('invariant', () => {
  it('should throw an error when condition is false', () => {
    expect(() => {
      invariant(false, 'message');
    }).toThrow(Error);
  });

  it("Should throw an error with the message if it's a string", () => {
    expect(() => {
      invariant(false, 'message');
    }).toThrow('message');
  });

  it('should contintue when condition is true', () => {
    expect(() => {
      invariant(true, 'message');
    }).not.toThrow();
  });

  describe('When passed message is a string object', () => {
    it('should throw the value of the string object', () => {
      expect(() => {
        invariant(false, new String('message'));
      }).toThrow('message');
    });
  });

  describe('Shen passed message is a function', () => {
    it('should throw the value of the function', () => {
      expect(() => {
        invariant(false, () => 'message');
      }).toThrow('message');
    });
  });

  describe('When message is falsy', () => {
    it('should throw an error with the message', () => {
      expect(() => {
        invariant(false, '');
      }).toThrow('');
    });
  });
});
