import _ from 'lodash';
import isDeepCopy, { SAMPLE_DEEP_OBJECT } from '.';

describe('Sanity (testing isDeepCopy)', () => {
  it('Should throw an error', () => {
    expect(() => isDeepCopy(SAMPLE_DEEP_OBJECT, SAMPLE_DEEP_OBJECT)).toThrow();
  });
  it('Should throw an error', () => {
    expect(() =>
      isDeepCopy(SAMPLE_DEEP_OBJECT, { ...SAMPLE_DEEP_OBJECT })
    ).toThrow();
  });
  it('Should throw for non equal primitives', () => {
    expect(() =>
      isDeepCopy(SAMPLE_DEEP_OBJECT[0], _.cloneDeep(SAMPLE_DEEP_OBJECT)[1])
    ).toThrow();
    expect(() =>
      isDeepCopy(
        {
          a: [1, { b: 2 }],
        },
        {
          a: [1, { b: 1 }],
        }
      )
    ).toThrow();
  });
});
