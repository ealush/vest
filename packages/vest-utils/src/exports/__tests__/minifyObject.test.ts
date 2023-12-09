import { expandObject, minifyObject } from 'minifyObject';

describe('minifyObject', () => {
  it('should be a function', () => {
    expect(typeof minifyObject).toBe('function');
  });

  it('should return an array', () => {
    expect(Array.isArray(minifyObject({}))).toBe(true);
  });

  it('should return an array with two items', () => {
    expect(minifyObject({})).toHaveLength(2);
  });

  it('should return an array with two items, the first being an object', () => {
    expect(typeof minifyObject({})[0]).toBe('object');
  });

  it('should return an array with two items, the second being an object', () => {
    expect(typeof minifyObject({})[1]).toBe('object');
  });

  it('Should return a minified object', () => {
    // we can't really test this because the minified object is random
    // but we can test that the object is minified
    // by checking that it is smaller than the original

    const obj = {
      lorem: 'ipsum',
      dolor: 'sit',
      amet: 'consectetur',
      adipiscing: 'elit',
      sed: [
        'lorem',
        'ipsum',
        'dolor',
        'sit',
        'amet',
        'consectetur',
        'adipiscing',
        'elit',
      ],
      sed2: [
        'lorem',
        'ipsum',
        'dolor',
        'sit',
        'amet',
        'consectetur',
        'adipiscing',
        'elit',
      ],
    };

    const [minified] = minifyObject(obj);
    expect(JSON.stringify(minified).length).toBeLessThan(
      JSON.stringify(obj).length,
    );
  });

  it('Should return a minified object with a reverse map', () => {
    // check that all the keys in the reverse map are in the minified object
    // either as a key or a value
    const obj = {
      lorem: 'ipsum',
      dolor: 'sit',
      amet: 'consectetur',
      adipiscing: 'elit',
    };

    const [minified, reverseMap] = minifyObject(obj);

    for (const key in reverseMap) {
      expect(minified[key] || Object.values(minified).includes(key)).toBe(true);
    }
  });

  describe('When a key only appears once', () => {
    it('Should remain in place', () => {
      const obj = {
        lorem: 'ipsum',
        dolor: false,
        amet: true,
        adipiscing: 1,
      };

      const [minified] = minifyObject(obj);
      expect(minified).toEqual(obj);
    });

    it('Should not appear in the mapping', () => {
      const obj = {
        lorem: 'ipsum',
        dolor: false,
        amet: true,
        adipiscing: 1,
      };

      const [, reverseMap] = minifyObject(obj);
      expect(reverseMap).toEqual({});
    });
  });

  it('Should omit nullish values', () => {
    const obj = {
      lorem: 'ipsum',
      dolor: null,
      amet: undefined,
      adipiscing: '',
    };

    const [minified] = minifyObject(obj);
    expect(minified).toEqual({ lorem: 'ipsum', adipiscing: '' });
  });

  it('Should omit functions', () => {
    const obj = {
      lorem: 'ipsum',
      dolor: () => {},
      amet() {},
      adipiscing: '',
    };

    const [minified] = minifyObject(obj);
    expect(minified).toEqual({ lorem: 'ipsum', adipiscing: '' });
  });

  it('Should omit symbols', () => {
    const obj = {
      lorem: 'ipsum',
      dolor: Symbol('dolor'),
      amet: Symbol('amet'),
      adipiscing: '',
    };

    const [minified] = minifyObject(obj);
    expect(minified).toEqual({ lorem: 'ipsum', adipiscing: '' });
  });

  it('Should give the most occuring values or keys the first keys', () => {
    const obj = {
      consectetur: ['consectetur'],
      amet: ['amet', 'amet'],
      sit: ['sit', 'sit', 'sit'],
      dolor: ['dolor', 'dolor', 'dolor', 'dolor'],
      ipsum: ['ipsum', 'ipsum', 'ipsum', 'ipsum', 'ipsum'],
      lorem: ['lorem', 'lorem', 'lorem', 'lorem', 'lorem', 'lorem'],
    };

    const [m, map] = minifyObject(obj);

    expect(map).toEqual({
      0: 'lorem',
      1: 'ipsum',
      2: 'dolor',
      3: 'sit',
      4: 'amet',
      5: 'consectetur',
    });
  });

  it('Should only minify values that are longer than the next key', () => {
    const obj = {
      a: 1,
      b: 2,
      c: 3,
      lorem: 'lorem',
    };
    expect(minifyObject(obj)).toEqual([
      {
        a: 1,
        b: 2,
        c: 3,
        0: '0',
      },
      { 0: 'lorem' },
    ]);
  });
});

describe('expandObject', () => {
  it('should be a function', () => {
    expect(typeof expandObject).toBe('function');
  });
  it('should take the output of minifyObject and return a clone original object', () => {
    const obj = {
      lorem: 'ipsum',
      dolor: ['lorem', 'ipsum'],
      amet: {
        lorem: 'ipsum',
        dolor: ['sit', 'amet'],
      },
      adipiscing: 'elit',
      number: 1,
      boolean: true,
      someValues: [
        'lorem',
        'ipsum',
        'dolor',
        'sit',
        'amet',
        {
          lorem: 'ipsum',
          dolor: ['sit', 'amet'],
        },
      ],
    };

    const [minified, reverseMap] = minifyObject(obj);

    expect(expandObject(minified, reverseMap)).toEqual(obj);
  });
});
