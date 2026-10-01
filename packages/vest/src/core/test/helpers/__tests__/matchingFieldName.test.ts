import { describe, it, expect } from 'vitest';

import matchingFieldName, { nonMatchingFieldName } from '../matchingFieldName';

describe('matchingFieldName', () => {
  it('should return true when the field names are equal', () => {
    expect(matchingFieldName({ fieldName: 'f1' }, 'f1').unwrap()).toBe(true);
  });

  it('should return false when the field names differ', () => {
    expect(matchingFieldName({ fieldName: 'f1' }, 'f2').unwrap()).toBe(false);
  });

  it('should return false when no field name is passed', () => {
    expect(matchingFieldName({ fieldName: 'f1' }).unwrap()).toBe(false);
  });

  it('should match an empty field name against itself', () => {
    expect(matchingFieldName({ fieldName: '' }, '').unwrap()).toBe(true);
    expect(matchingFieldName({ fieldName: 'f1' }, '').unwrap()).toBe(false);
    expect(matchingFieldName({ fieldName: '' }, 'f1').unwrap()).toBe(false);
  });
});

describe('nonMatchingFieldName', () => {
  it('should return true only when a different field name is passed', () => {
    expect(nonMatchingFieldName({ fieldName: 'f1' }, 'f2').unwrap()).toBe(true);
    expect(nonMatchingFieldName({ fieldName: 'f1' }, 'f1').unwrap()).toBe(
      false,
    );
    expect(nonMatchingFieldName({ fieldName: 'f1' }).unwrap()).toBe(false);
  });
});
