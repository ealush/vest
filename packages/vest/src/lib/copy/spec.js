import { SAMPLE_DEEP_OBJECT } from '../../../testUtils/isDeepCopy';
import copy from '.';

describe('copy', () => {
  it('Should deep equal source object', () => {
    expect(copy(SAMPLE_DEEP_OBJECT)).toEqual(SAMPLE_DEEP_OBJECT);
  });

  it('Should deep copy source object', () => {
    const clone = copy(SAMPLE_DEEP_OBJECT);

    expect(SAMPLE_DEEP_OBJECT).isDeepCopyOf(clone);
    expect(SAMPLE_DEEP_OBJECT[0].range).isDeepCopyOf(clone[0].range);
    expect(SAMPLE_DEEP_OBJECT[1].range[0].b).isDeepCopyOf(clone[1].range[0].b);
  });
});
