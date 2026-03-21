import { describe, expect, it } from 'vitest';

import { TestSeverity } from '../../../../suiteResult/Severity';
import { mockIsolateTest } from '../../../../testUtils/vestMocks';
import { VestTest } from '../VestTest';

describe('VestTest Severities', () => {
  it('should default to "error" severity', () => {
    const test = mockIsolateTest({ fieldName: 'field1' });

    expect(VestTest.getData(test).severity).toBe(TestSeverity.Error);
  });

  it('should allow setting severity to success, overwriting previous values', () => {
    const test = mockIsolateTest({ fieldName: 'field1' });

    VestTest.setSeverity(test, TestSeverity.Success);
    expect(VestTest.getData(test).severity).toBe(TestSeverity.Success);
  });
});
