import _ from 'lodash';

import isDeepCopy from '.';

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

const SAMPLE_DEEP_OBJECT = [
  {
    _id: '5eb4784ee29b8b3003688425',
    index: 0,
    name: {
      first: 'Velasquez',
      last: 'Lara',
    },
    range: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    tags: ['Lorem', 'ullamco', 'minim', 'ut', 'ad'],
  },
  {
    _id: '5eb4784e64618155ef167791',
    index: 1,
    name: {
      first: 'Mcconnell',
      last: 'Dennis',
    },
    range: [
      {
        a: 1,
        b: [
          {
            a: 2,
            c: ['one', 'two', 'three', 'four'],
          },
        ],
      },
    ],
    tags: ['nulla', 'ex', 'et', 'sint', 'aliqua'],
  },
];
