import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

describe('isString', () => {
  describe('base predicate', () => {
    it('pass for strings', () => {
      expect(enforce.isString().run('a').pass).toBe(true);
      expect(enforce.isString().run('').pass).toBe(true);
      expect(enforce.isString().run('hello').pass).toBe(true);
      expect(enforce.isString().run('123').pass).toBe(true);
    });

    it('fails for non-strings', () => {
      const num: any = 1;
      const bool: any = true;
      const obj: any = {};
      const arr: any = [];
      const nul: any = null;
      const undef: any = undefined;
      expect(enforce.isString().run(num).pass).toBe(false);
      expect(enforce.isString().run(bool).pass).toBe(false);
      expect(enforce.isString().run(obj).pass).toBe(false);
      expect(enforce.isString().run(arr).pass).toBe(false);
      expect(enforce.isString().run(nul).pass).toBe(false);
      expect(enforce.isString().run(undef).pass).toBe(false);
    });
  });

  describe('startsWith', () => {
    it('pass when string starts with prefix', () => {
      expect(enforce.isString().startsWith('he').run('hello').pass).toBe(true);
      expect(enforce.isString().startsWith('').run('hello').pass).toBe(true);
      expect(enforce.isString().startsWith('hel').run('hello').pass).toBe(true);
    });

    it('fails when string does not start with prefix', () => {
      expect(enforce.isString().startsWith('x').run('hello').pass).toBe(false);
      expect(enforce.isString().startsWith('lo').run('hello').pass).toBe(false);
    });
  });

  describe('doesNotStartWith', () => {
    it('pass when string does not start with prefix', () => {
      expect(enforce.isString().doesNotStartWith('x').run('hello').pass).toBe(
        true,
      );
      expect(enforce.isString().doesNotStartWith('lo').run('hello').pass).toBe(
        true,
      );
    });

    it('fails when string starts with prefix', () => {
      expect(enforce.isString().doesNotStartWith('he').run('hello').pass).toBe(
        false,
      );
      expect(enforce.isString().doesNotStartWith('hel').run('hello').pass).toBe(
        false,
      );
    });
  });

  describe('endsWith', () => {
    it('pass when string ends with suffix', () => {
      expect(enforce.isString().endsWith('lo').run('hello').pass).toBe(true);
      expect(enforce.isString().endsWith('').run('hello').pass).toBe(true);
      expect(enforce.isString().endsWith('llo').run('hello').pass).toBe(true);
    });

    it('fails when string does not end with suffix', () => {
      expect(enforce.isString().endsWith('x').run('hello').pass).toBe(false);
      expect(enforce.isString().endsWith('he').run('hello').pass).toBe(false);
    });
  });

  describe('doesNotEndWith', () => {
    it('pass when string does not end with suffix', () => {
      expect(enforce.isString().doesNotEndWith('x').run('hello').pass).toBe(
        true,
      );
      expect(enforce.isString().doesNotEndWith('he').run('hello').pass).toBe(
        true,
      );
    });

    it('fails when string ends with suffix', () => {
      expect(enforce.isString().doesNotEndWith('lo').run('hello').pass).toBe(
        false,
      );
      expect(enforce.isString().doesNotEndWith('llo').run('hello').pass).toBe(
        false,
      );
    });
  });

  describe('matches', () => {
    it('pass when string matches regex', () => {
      expect(enforce.isString().matches(/^h/).run('hello').pass).toBe(true);
      expect(enforce.isString().matches(/o$/).run('hello').pass).toBe(true);
      expect(enforce.isString().matches(/\d+/).run('abc123').pass).toBe(true);
    });

    it('pass with string pattern', () => {
      expect(enforce.isString().matches('^h').run('hello').pass).toBe(true);
      expect(enforce.isString().matches('o$').run('hello').pass).toBe(true);
    });

    it('fails when string does not match', () => {
      expect(enforce.isString().matches(/^x/).run('hello').pass).toBe(false);
      expect(enforce.isString().matches(/\d+/).run('hello').pass).toBe(false);
    });
  });

  describe('notMatches', () => {
    it('pass when string does not match regex', () => {
      expect(enforce.isString().notMatches(/^x/).run('hello').pass).toBe(true);
      expect(enforce.isString().notMatches(/\d+/).run('hello').pass).toBe(true);
    });

    it('fails when string matches', () => {
      expect(enforce.isString().notMatches(/^h/).run('hello').pass).toBe(false);
      expect(enforce.isString().notMatches(/o$/).run('hello').pass).toBe(false);
    });
  });

  describe('isBlank', () => {
    it('pass for empty strings', () => {
      expect(enforce.isString().isBlank().run('').pass).toBe(true);
    });

    it('pass for whitespace-only strings', () => {
      expect(enforce.isString().isBlank().run(' ').pass).toBe(true);
      expect(enforce.isString().isBlank().run('  ').pass).toBe(true);
      expect(enforce.isString().isBlank().run('\t').pass).toBe(true);
      expect(enforce.isString().isBlank().run('\n').pass).toBe(true);
    });

    it('fails for strings with content', () => {
      expect(enforce.isString().isBlank().run('x').pass).toBe(false);
      expect(enforce.isString().isBlank().run(' x ').pass).toBe(false);
      expect(enforce.isString().isBlank().run('hello').pass).toBe(false);
    });
  });

  describe('isNotBlank', () => {
    it('pass for strings with content', () => {
      expect(enforce.isString().isNotBlank().run('x').pass).toBe(true);
      expect(enforce.isString().isNotBlank().run('hello').pass).toBe(true);
      expect(enforce.isString().isNotBlank().run(' x ').pass).toBe(true);
    });

    it('fails for empty strings', () => {
      expect(enforce.isString().isNotBlank().run('').pass).toBe(false);
    });

    it('fails for whitespace-only strings', () => {
      expect(enforce.isString().isNotBlank().run(' ').pass).toBe(false);
      expect(enforce.isString().isNotBlank().run('  ').pass).toBe(false);
      expect(enforce.isString().isNotBlank().run('\t').pass).toBe(false);
    });
  });

  describe('minLength', () => {
    it('pass when string length is greater than or equal to minimum', () => {
      expect(enforce.isString().minLength(2).run('hi').pass).toBe(true);
      expect(enforce.isString().minLength(2).run('hello').pass).toBe(true);
      expect(enforce.isString().minLength(0).run('').pass).toBe(true);
    });

    it('fails when string length is less than minimum', () => {
      expect(enforce.isString().minLength(3).run('hi').pass).toBe(false);
      expect(enforce.isString().minLength(1).run('').pass).toBe(false);
    });
  });

  describe('maxLength', () => {
    it('pass when string length is less than or equal to maximum', () => {
      expect(enforce.isString().maxLength(2).run('hi').pass).toBe(true);
      expect(enforce.isString().maxLength(5).run('hi').pass).toBe(true);
      expect(enforce.isString().maxLength(0).run('').pass).toBe(true);
    });

    it('fails when string length is greater than maximum', () => {
      expect(enforce.isString().maxLength(1).run('hi').pass).toBe(false);
      expect(enforce.isString().maxLength(2).run('hello').pass).toBe(false);
    });
  });

  describe('lengthEquals', () => {
    it('pass when string length equals the specified value', () => {
      expect(enforce.isString().lengthEquals(5).run('hello').pass).toBe(true);
      expect(enforce.isString().lengthEquals(0).run('').pass).toBe(true);
      expect(enforce.isString().lengthEquals(3).run('abc').pass).toBe(true);
    });

    it('fails when string length does not equal the specified value', () => {
      expect(enforce.isString().lengthEquals(3).run('hello').pass).toBe(false);
      expect(enforce.isString().lengthEquals(1).run('').pass).toBe(false);
    });
  });

  describe('lengthNotEquals', () => {
    it('pass when string length does not equal the specified value', () => {
      expect(enforce.isString().lengthNotEquals(3).run('hello').pass).toBe(
        true,
      );
      expect(enforce.isString().lengthNotEquals(1).run('').pass).toBe(true);
    });

    it('fails when string length equals the specified value', () => {
      expect(enforce.isString().lengthNotEquals(5).run('hello').pass).toBe(
        false,
      );
      expect(enforce.isString().lengthNotEquals(0).run('').pass).toBe(false);
    });
  });
});
