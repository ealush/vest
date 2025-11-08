import { StringObject } from 'StringObject';
import { describe, test, expect } from 'vitest';

describe('StringObject', () => {
  test('returns an instance of String', () => {
    const str = StringObject('hello');
    expect(str).toBeInstanceOf(String);
  });

  describe('When the passed value is a function that returns a string', () => {
    it('should return a string object with the value of the function', () => {
      const str = StringObject(() => 'hello');
      expect(str).toBeInstanceOf(String);
      expect(str.toString()).toBe('hello');
    });
  });
});
