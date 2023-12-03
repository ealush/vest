import { minifyObject, expandObject } from 'minifyObject';

describe('minifyObject', () => {
  it('should minify object', () => {
    const obj = {
      writing: 'words',
      and: 'more',
      words: 'here',
    };

    const { s, m } = minifyObject(obj);

    expect(JSON.stringify(s).length).toBeLessThan(JSON.stringify(obj).length);
  });

  it('Should return a map of minified values', () => {
    const obj = {
      writing: 'words',
      and: 'more',
      words: {
        writing: 'words',
        and: 'more',
        words: 'here',
      },
    };

    const { m } = minifyObject(obj);

    // m should include all the keys and values of obj
    // each word should be present in the object
    // m is inverted, so the keys are the minified values
    // and the values are the original values
    const v = Object.values(m);
    for (const key in obj) {
      expect(v).toContain(key);
    }
  });

  it('Should minify values in arrays', () => {
    const obj = {
      fruits: ['banana', 'apple', 'orange', 'banana', 'apple', 'orange'],
    };

    const { s } = minifyObject(obj);

    traverse(s, (key, value) => {
      expect(key.length).toBeLessThan(3);
      if (typeof value === 'string') {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(value.length).toBeLessThan(3);
      }
    });
    expect(JSON.stringify(s).length).toBeLessThan(JSON.stringify(obj).length);
  });

  it('should deeply minify objects', () => {
    const obj = {
      random: 'words',
      and: 'more',
      words: 'here',
      with: {
        some: 'more',
        random: 'words',
        and: 'more',
        words: 'here',
        nested: {
          some: 'more',
          random: 'words',
          and: 'more',
          words: 'here',
          deep: {
            some: 'more',
            random: 'words',
            and: 'more',
            words: 'here',
          },
        },
      },
    };

    const { s, m } = minifyObject(obj);

    // expect all deeply nested keys and values to be less than the original
    traverse(s, (key, value) => {
      expect(key.length).toBeLessThan(3);
      if (typeof value === 'string') {
        // eslint-disable-next-line jest/no-conditional-expect
        expect(value.length).toBeLessThan(3);
      }
    });
  });

  describe('Object in arrays', () => {
    it('should minify object in array', () => {
      const obj = {
        fruits: [
          {
            name: 'banana',
            color: 'yellow',
          },
          {
            name: 'banana',
            color: 'yellow',
          },
          {
            name: 'banana',
            color: 'yellow',
          },
        ],
      };

      const { s, m } = minifyObject(obj);

      expect(m).toEqual({
        0: 'fruits',
        1: 'name',
        2: 'banana',
        3: 'color',
        4: 'yellow',
      });

      expect(s).toEqual({
        0: [
          { 1: '2', 3: '4' },
          { 1: '2', 3: '4' },
          { 1: '2', 3: '4' },
        ],
      });

      traverse(s, (key, value) => {
        expect(key.length).toBeLessThan(3);
        if (typeof value === 'string') {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(value.length).toBeLessThan(3);
        }
      });
    });
  });

  describe("When value appears more than once in object's values", () => {
    it('should stay in place, prefixed by _', () => {
      const obj = {
        single: 'use',
        words: "don't",
        matter: {
          much: 'because',
        },
      };

      const { s } = minifyObject(obj);
      expect(s).toEqual({ 0: '_use', 1: "_don't", 2: { 3: '_because' } });
    });

    it("Should omit the value's key from the map", () => {
      const obj = {
        single: 'use',
        words: "don't",
        matter: {
          much: 'because',
        },
      };

      const { m } = minifyObject(obj);
      expect(m).toEqual({ 0: 'single', 1: 'words', 2: 'matter', 3: 'much' });
    });
  });
});

// deeply traverse object and run callback on each key and value
function traverse(obj: any, callback: (key: string, value: any) => void) {
  for (const key in obj) {
    callback(key, obj[key]);
    if (typeof obj[key] === 'object') {
      traverse(obj[key], callback);
    }
  }
}
