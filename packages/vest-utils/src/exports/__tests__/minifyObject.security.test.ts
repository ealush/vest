import { describe, it, expect } from 'vitest';
import { expandObject } from '../minifyObject';

describe('minifyObject Security', () => {
  describe('Prototype Pollution', () => {
    it('Should not allow pollution via "__proto__" key', () => {
      const maliciousPayload = '{"__proto__":{"polluted":true}}';
      const parsed = JSON.parse(maliciousPayload);

      // Simulate expansion (minifyObject's expandObject handles the reconstruction)
      // We pass an empty map as we are testing raw key assignment
      const expanded = expandObject(parsed, {});

      // @ts-ignore
      expect({}.polluted).toBeUndefined();
      expect(expanded.polluted).toBeUndefined();
      // @ts-ignore
      expect(expanded.__proto__).not.toEqual({ polluted: true });
    });

    it('Should not allow pollution via "constructor" key', () => {
      const maliciousPayload =
        '{"constructor":{"prototype":{"polluted":true}}}';
      const parsed = JSON.parse(maliciousPayload);

      const expanded = expandObject(parsed, {});

      // @ts-ignore
      expect({}.polluted).toBeUndefined();
      expect(expanded.constructor?.prototype?.polluted).toBeUndefined();
    });

    it('Should not allow pollution via "prototype" key', () => {
      const maliciousPayload = '{"prototype":{"polluted":true}}';
      const parsed = JSON.parse(maliciousPayload);

      expandObject(parsed, {});

      // @ts-ignore
      expect({}.polluted).toBeUndefined();
    });
  });

  describe('Sanity: Unprotected JSON.parse behavior', () => {
    it('Should preserve "__proto__" as a plain key when using standard JSON.parse', () => {
      const json = '{"__proto__":{"polluted":true}}';
      const parsed = JSON.parse(json);

      // This confirms that the environment allows parsing this key
      // which justifies the need for our protections.
      expect(Object.prototype.hasOwnProperty.call(parsed, '__proto__')).toBe(
        true,
      );
      expect(parsed.__proto__).toEqual({ polluted: true });
    });

    it('Should preserve "constructor" as a plain key when using standard JSON.parse', () => {
      const json = '{"constructor":{"prototype":{"polluted":true}}}';
      const parsed = JSON.parse(json);

      expect(parsed).toHaveProperty('constructor');
      expect(parsed.constructor).toEqual({ prototype: { polluted: true } });
    });
  });
});
