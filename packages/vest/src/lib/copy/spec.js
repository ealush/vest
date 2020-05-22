import isDeepCopy, { SAMPLE_DEEP_OBJECT } from '../../../testUtils/isDeepCopy';
import copy from '.';

describe('copy', () => {
  it('Should deep equal source object', () => {
    expect(copy(SAMPLE_DEEP_OBJECT)).toEqual(SAMPLE_DEEP_OBJECT);
  });

  it('Should deep copy source object', () => {
    const clone = copy(SAMPLE_DEEP_OBJECT);

    isDeepCopy(SAMPLE_DEEP_OBJECT, clone);
    isDeepCopy(SAMPLE_DEEP_OBJECT[0].range, clone[0].range);
    isDeepCopy(SAMPLE_DEEP_OBJECT[1].range[0].b, clone[1].range[0].b);
  });
});
