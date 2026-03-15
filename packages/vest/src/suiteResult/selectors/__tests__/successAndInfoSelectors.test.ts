import { describe, expect, it } from 'vitest';

import { create, enforce, info, success, test } from '../../../vest';

describe('Success and Info Selectors', () => {
  it('should return boolean and message arrays for has/get Successes and Info', () => {
    const suite = create(() => {
      test('pass', 'good password', () => {
        success();
        enforce('abc').isNotBlank();
      });
      test('user', 'auto formatted', () => {
        info();
        enforce('john').isNotBlank();
      });
      test('failCase', 'should not be appended if enforcement fails', () => {
        success();
        enforce(1).equals(2);
      });
    });

    const res = suite.run();

    expect(res.hasSuccesses('pass')).toBe(true);
    expect(res.hasSuccesses('user')).toBe(false);
    expect(res.hasInfo('user')).toBe(true);

    expect(res.getSuccesses('pass')).toEqual(['good password']);
    expect(res.getInfo('user')).toEqual(['auto formatted']);

    expect(res.hasSuccesses('failCase')).toBe(false);
    expect(res.isValid()).toBe(true);
  });
});
