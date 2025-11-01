import { describe, it, expect } from 'vitest';

import { isString } from '../string/isString';

describe('isString', () => {
  describe('base predicate', () => {
    it('passes for strings', () => {
      expect(isString().run('a').passes).toBe(true);
      expect(isString().run('').passes).toBe(true);
      expect(isString().run('hello').passes).toBe(true);
      expect(isString().run('123').passes).toBe(true);
    });

    it('fails for non-strings', () => {
      const num: any = 1;
      const bool: any = true;
      const obj: any = {};
      const arr: any = [];
      const nul: any = null;
      const undef: any = undefined;
      expect(isString().run(num).passes).toBe(false);
      expect(isString().run(bool).passes).toBe(false);
      expect(isString().run(obj).passes).toBe(false);
      expect(isString().run(arr).passes).toBe(false);
      expect(isString().run(nul).passes).toBe(false);
      expect(isString().run(undef).passes).toBe(false);
    });
  });

  describe('startsWith', () => {
    it('passes when string starts with prefix', () => {
      expect(isString().startsWith('he').run('hello').passes).toBe(true);
      expect(isString().startsWith('').run('hello').passes).toBe(true);
      expect(isString().startsWith('hel').run('hello').passes).toBe(true);
    });

    it('fails when string does not start with prefix', () => {
      expect(isString().startsWith('x').run('hello').passes).toBe(false);
      expect(isString().startsWith('lo').run('hello').passes).toBe(false);
    });
  });

  describe('doesNotStartWith', () => {
    it('passes when string does not start with prefix', () => {
      expect(isString().doesNotStartWith('x').run('hello').passes).toBe(true);
      expect(isString().doesNotStartWith('lo').run('hello').passes).toBe(true);
    });

    it('fails when string starts with prefix', () => {
      expect(isString().doesNotStartWith('he').run('hello').passes).toBe(false);
      expect(isString().doesNotStartWith('hel').run('hello').passes).toBe(
        false,
      );
    });
  });

  describe('endsWith', () => {
    it('passes when string ends with suffix', () => {
      expect(isString().endsWith('lo').run('hello').passes).toBe(true);
      expect(isString().endsWith('').run('hello').passes).toBe(true);
      expect(isString().endsWith('llo').run('hello').passes).toBe(true);
    });

    it('fails when string does not end with suffix', () => {
      expect(isString().endsWith('x').run('hello').passes).toBe(false);
      expect(isString().endsWith('he').run('hello').passes).toBe(false);
    });
  });

  describe('doesNotEndWith', () => {
    it('passes when string does not end with suffix', () => {
      expect(isString().doesNotEndWith('x').run('hello').passes).toBe(true);
      expect(isString().doesNotEndWith('he').run('hello').passes).toBe(true);
    });

    it('fails when string ends with suffix', () => {
      expect(isString().doesNotEndWith('lo').run('hello').passes).toBe(false);
      expect(isString().doesNotEndWith('llo').run('hello').passes).toBe(false);
    });
  });

  describe('matches', () => {
    it('passes when string matches regex', () => {
      expect(isString().matches(/^h/).run('hello').passes).toBe(true);
      expect(isString().matches(/o$/).run('hello').passes).toBe(true);
      expect(isString().matches(/\d+/).run('abc123').passes).toBe(true);
    });

    it('passes with string pattern', () => {
      expect(isString().matches('^h').run('hello').passes).toBe(true);
      expect(isString().matches('o$').run('hello').passes).toBe(true);
    });

    it('fails when string does not match', () => {
      expect(isString().matches(/^x/).run('hello').passes).toBe(false);
      expect(isString().matches(/\d+/).run('hello').passes).toBe(false);
    });
  });

  describe('doesNotMatch', () => {
    it('passes when string does not match regex', () => {
      // @ts-expect-error - doesNotMatch may not be in type definition yet
      expect(isString().doesNotMatch(/^x/).run('hello').passes).toBe(true);
      // @ts-expect-error - doesNotMatch may not be in type definition yet
      expect(isString().doesNotMatch(/\d+/).run('hello').passes).toBe(true);
    });

    it('fails when string matches', () => {
      // @ts-expect-error - doesNotMatch may not be in type definition yet
      expect(isString().doesNotMatch(/^h/).run('hello').passes).toBe(false);
      // @ts-expect-error - doesNotMatch may not be in type definition yet
      expect(isString().doesNotMatch(/o$/).run('hello').passes).toBe(false);
    });
  });

  describe('isBlank', () => {
    it('passes for empty strings', () => {
      expect(isString().isBlank().run('').passes).toBe(true);
    });

    it('passes for whitespace-only strings', () => {
      expect(isString().isBlank().run(' ').passes).toBe(true);
      expect(isString().isBlank().run('  ').passes).toBe(true);
      expect(isString().isBlank().run('\t').passes).toBe(true);
      expect(isString().isBlank().run('\n').passes).toBe(true);
    });

    it('fails for strings with content', () => {
      expect(isString().isBlank().run('x').passes).toBe(false);
      expect(isString().isBlank().run(' x ').passes).toBe(false);
      expect(isString().isBlank().run('hello').passes).toBe(false);
    });
  });

  describe('isNotBlank', () => {
    it('passes for strings with content', () => {
      expect(isString().isNotBlank().run('x').passes).toBe(true);
      expect(isString().isNotBlank().run('hello').passes).toBe(true);
      expect(isString().isNotBlank().run(' x ').passes).toBe(true);
    });

    it('fails for empty strings', () => {
      expect(isString().isNotBlank().run('').passes).toBe(false);
    });

    it('fails for whitespace-only strings', () => {
      expect(isString().isNotBlank().run(' ').passes).toBe(false);
      expect(isString().isNotBlank().run('  ').passes).toBe(false);
      expect(isString().isNotBlank().run('\t').passes).toBe(false);
    });
  });

  describe('minLength', () => {
    it('passes when string length is greater than or equal to minimum', () => {
      expect(isString().minLength(2).run('hi').passes).toBe(true);
      expect(isString().minLength(2).run('hello').passes).toBe(true);
      expect(isString().minLength(0).run('').passes).toBe(true);
    });

    it('fails when string length is less than minimum', () => {
      expect(isString().minLength(3).run('hi').passes).toBe(false);
      expect(isString().minLength(1).run('').passes).toBe(false);
    });
  });

  describe('maxLength', () => {
    it('passes when string length is less than or equal to maximum', () => {
      expect(isString().maxLength(2).run('hi').passes).toBe(true);
      expect(isString().maxLength(5).run('hi').passes).toBe(true);
      expect(isString().maxLength(0).run('').passes).toBe(true);
    });

    it('fails when string length is greater than maximum', () => {
      expect(isString().maxLength(1).run('hi').passes).toBe(false);
      expect(isString().maxLength(2).run('hello').passes).toBe(false);
    });
  });

  describe('lengthEquals', () => {
    it('passes when string length equals the specified value', () => {
      expect(isString().lengthEquals(5).run('hello').passes).toBe(true);
      expect(isString().lengthEquals(0).run('').passes).toBe(true);
      expect(isString().lengthEquals(3).run('abc').passes).toBe(true);
    });

    it('fails when string length does not equal the specified value', () => {
      expect(isString().lengthEquals(3).run('hello').passes).toBe(false);
      expect(isString().lengthEquals(1).run('').passes).toBe(false);
    });
  });

  describe('lengthNotEquals', () => {
    it('passes when string length does not equal the specified value', () => {
      expect(isString().lengthNotEquals(3).run('hello').passes).toBe(true);
      expect(isString().lengthNotEquals(1).run('').passes).toBe(true);
    });

    it('fails when string length equals the specified value', () => {
      expect(isString().lengthNotEquals(5).run('hello').passes).toBe(false);
      expect(isString().lengthNotEquals(0).run('').passes).toBe(false);
    });
  });
});
