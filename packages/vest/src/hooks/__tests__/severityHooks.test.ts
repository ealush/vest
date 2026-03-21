import { describe, expect, it } from 'vitest';

import { create, enforce, success, test, warn } from '../../vest';

describe('Severity Hooks', () => {
  it('should apply positive severities to the current test', () => {
    const suite = create(() => {
      test('field1', 'is success', () => {
        success();
        enforce(1).equals(1);
      });
      test('field3', 'last severity wins', () => {
        warn();
        success();
        enforce(1).equals(1);
      });
    });

    const res = suite.run();

    expect(res.isValid()).toBe(true);
  });
});
