import _ from 'lodash';
import isDeepCopy, { SAMPLE_DEEP_OBJECT } from '.';

describe('Sanity (testing isDeepCopy)', () => {
  it('Should fail when same value', () => {
    expect(isDeepCopy(SAMPLE_DEEP_OBJECT, SAMPLE_DEEP_OBJECT).pass).toBe(false);
  });
  it('Should fail when shallow copy', () => {
    expect(isDeepCopy(SAMPLE_DEEP_OBJECT, { ...SAMPLE_DEEP_OBJECT }).pass).toBe(
      false
    );
  });
  it('Should fail for non equal primitives', () => {
    expect(
      isDeepCopy(SAMPLE_DEEP_OBJECT[0], _.cloneDeep(SAMPLE_DEEP_OBJECT)[1]).pass
    ).toBe(false);
    expect(
      isDeepCopy(
        {
          a: [1, { b: 2 }],
        },
        {
          a: [1, { b: 1 }],
        }
      ).pass
    ).toBe(false);
  });
  it('Should pass for deeply equal objects', () => {
    expect(
      isDeepCopy(SAMPLE_DEEP_OBJECT, _.cloneDeep(SAMPLE_DEEP_OBJECT)).pass
    ).toBe(true);
  });
});
