import { describe, it, expect } from 'vitest';
import { isVestIsolate, VestIsolateType } from '../VestIsolateType';

describe('isVestIsolate', () => {
  it('Should return false for null', () => {
    expect(isVestIsolate(null)).toBe(false);
  });

  it('Should return true for all Vest isolate types', () => {
    Object.values(VestIsolateType).forEach(type => {
      const isolate = { $type: type, data: {}, children: null } as any;
      expect(isVestIsolate(isolate)).toBe(true);
    });
  });

  it('Should return false for non-Vest isolate types', () => {
    const isolate = { $type: 'CustomType', data: {}, children: null } as any;
    expect(isVestIsolate(isolate)).toBe(false);
  });

  it('Should return false for isolate with no $type', () => {
    const isolate = { data: {}, children: null } as any;
    expect(isVestIsolate(isolate)).toBe(false);
  });

  it('Should work correctly after deserialization (no data.tests)', () => {
    // After serialization/deserialization, data.tests is stripped
    // This test verifies the new $type-based check works
    const serializedIsolate = {
      $type: VestIsolateType.Suite,
      data: {}, // No 'tests' property
      children: null,
    } as any;
    expect(isVestIsolate(serializedIsolate)).toBe(true);
  });
});
