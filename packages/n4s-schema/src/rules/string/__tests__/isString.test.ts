import { describe, it, expect } from 'vitest';

import { enforceLazy } from '../../../lazy';

describe('isString', () => {
  describe('base predicate', () => {
    it('passes for strings', () => {
      expect(enforceLazy.isString().run('a').passes).toBe(true);
      expect(enforceLazy.isString().run('').passes).toBe(true);
      expect(enforceLazy.isString().run('hello').passes).toBe(true);
      expect(enforceLazy.isString().run('123').passes).toBe(true);
    });

    it('fails for non-strings', () => {
      const num: any = 1;
      const bool: any = true;
      const obj: any = {};
      const arr: any = [];
      const nul: any = null;
      const undef: any = undefined;
      expect(enforceLazy.isString().run(num).passes).toBe(false);
      expect(enforceLazy.isString().run(bool).passes).toBe(false);
      expect(enforceLazy.isString().run(obj).passes).toBe(false);
      expect(enforceLazy.isString().run(arr).passes).toBe(false);
      expect(enforceLazy.isString().run(nul).passes).toBe(false);
      expect(enforceLazy.isString().run(undef).passes).toBe(false);
    });
  });

  describe('startsWith', () => {
    it('passes when string starts with prefix', () => {
      expect(enforceLazy.isString().startsWith('he').run('hello').passes).toBe(true);
      expect(enforceLazy.isString().startsWith('').run('hello').passes).toBe(true);
      expect(enforceLazy.isString().startsWith('hel').run('hello').passes).toBe(true);
    });

    it('fails when string does not start with prefix', () => {
      expect(enforceLazy.isString().startsWith('x').run('hello').passes).toBe(false);
      expect(enforceLazy.isString().startsWith('lo').run('hello').passes).toBe(false);
    });
  });

  describe('doesNotStartWith', () => {
    it('passes when string does not start with prefix', () => {
      expect(enforceLazy.isString().doesNotStartWith('x').run('hello').passes).toBe(true);
      expect(enforceLazy.isString().doesNotStartWith('lo').run('hello').passes).toBe(true);
    });

    it('fails when string starts with prefix', () => {
      expect(enforceLazy.isString().doesNotStartWith('he').run('hello').passes).toBe(false);
      expect(enforceLazy.isString().doesNotStartWith('hel').run('hello').passes).toBe(
        false,
      );
    });
  });

  describe('endsWith', () => {
    it('passes when string ends with suffix', () => {
      expect(enforceLazy.isString().endsWith('lo').run('hello').passes).toBe(true);
      expect(enforceLazy.isString().endsWith('').run('hello').passes).toBe(true);
      expect(enforceLazy.isString().endsWith('llo').run('hello').passes).toBe(true);
    });

    it('fails when string does not end with suffix', () => {
      expect(enforceLazy.isString().endsWith('x').run('hello').passes).toBe(false);
      expect(enforceLazy.isString().endsWith('he').run('hello').passes).toBe(false);
    });
  });

  describe('doesNotEndWith', () => {
    it('passes when string does not end with suffix', () => {
      expect(enforceLazy.isString().doesNotEndWith('x').run('hello').passes).toBe(true);
      expect(enforceLazy.isString().doesNotEndWith('he').run('hello').passes).toBe(true);
    });

    it('fails when string ends with suffix', () => {
      expect(enforceLazy.isString().doesNotEndWith('lo').run('hello').passes).toBe(false);
      expect(enforceLazy.isString().doesNotEndWith('llo').run('hello').passes).toBe(false);
    });
  });

  describe('matches', () => {
    it('passes when string matches regex', () => {
      expect(enforceLazy.isString().matches(/^h/).run('hello').passes).toBe(true);
      expect(enforceLazy.isString().matches(/o$/).run('hello').passes).toBe(true);
      expect(enforceLazy.isString().matches(/\d+/).run('abc123').passes).toBe(true);
    });

    it('passes with string pattern', () => {
      expect(enforceLazy.isString().matches('^h').run('hello').passes).toBe(true);
      expect(enforceLazy.isString().matches('o$').run('hello').passes).toBe(true);
    });

    it('fails when string does not match', () => {
      expect(enforceLazy.isString().matches(/^x/).run('hello').passes).toBe(false);
      expect(enforceLazy.isString().matches(/\d+/).run('hello').passes).toBe(false);
    });
  });

  describe('notMatches', () => {
    it('passes when string does not match regex', () => {
      expect(enforceLazy.isString().notMatches(/^x/).run('hello').passes).toBe(true);
      expect(enforceLazy.isString().notMatches(/\d+/).run('hello').passes).toBe(true);
    });

    it('fails when string matches', () => {
      expect(enforceLazy.isString().notMatches(/^h/).run('hello').passes).toBe(false);
      expect(enforceLazy.isString().notMatches(/o$/).run('hello').passes).toBe(false);
    });
  });

  describe('isBlank', () => {
    it('passes for empty strings', () => {
      expect(enforceLazy.isString().isBlank().run('').passes).toBe(true);
    });

    it('passes for whitespace-only strings', () => {
      expect(enforceLazy.isString().isBlank().run(' ').passes).toBe(true);
      expect(enforceLazy.isString().isBlank().run('  ').passes).toBe(true);
      expect(enforceLazy.isString().isBlank().run('\t').passes).toBe(true);
      expect(enforceLazy.isString().isBlank().run('\n').passes).toBe(true);
    });

    it('fails for strings with content', () => {
      expect(enforceLazy.isString().isBlank().run('x').passes).toBe(false);
      expect(enforceLazy.isString().isBlank().run(' x ').passes).toBe(false);
      expect(enforceLazy.isString().isBlank().run('hello').passes).toBe(false);
    });
  });

  describe('isNotBlank', () => {
    it('passes for strings with content', () => {
      expect(enforceLazy.isString().isNotBlank().run('x').passes).toBe(true);
      expect(enforceLazy.isString().isNotBlank().run('hello').passes).toBe(true);
      expect(enforceLazy.isString().isNotBlank().run(' x ').passes).toBe(true);
    });

    it('fails for empty strings', () => {
      expect(enforceLazy.isString().isNotBlank().run('').passes).toBe(false);
    });

    it('fails for whitespace-only strings', () => {
      expect(enforceLazy.isString().isNotBlank().run(' ').passes).toBe(false);
      expect(enforceLazy.isString().isNotBlank().run('  ').passes).toBe(false);
      expect(enforceLazy.isString().isNotBlank().run('\t').passes).toBe(false);
    });
  });

  describe('minLength', () => {
    it('passes when string length is greater than or equal to minimum', () => {
      expect(enforceLazy.isString().minLength(2).run('hi').passes).toBe(true);
      expect(enforceLazy.isString().minLength(2).run('hello').passes).toBe(true);
      expect(enforceLazy.isString().minLength(0).run('').passes).toBe(true);
    });

    it('fails when string length is less than minimum', () => {
      expect(enforceLazy.isString().minLength(3).run('hi').passes).toBe(false);
      expect(enforceLazy.isString().minLength(1).run('').passes).toBe(false);
    });
  });

  describe('maxLength', () => {
    it('passes when string length is less than or equal to maximum', () => {
      expect(enforceLazy.isString().maxLength(2).run('hi').passes).toBe(true);
      expect(enforceLazy.isString().maxLength(5).run('hi').passes).toBe(true);
      expect(enforceLazy.isString().maxLength(0).run('').passes).toBe(true);
    });

    it('fails when string length is greater than maximum', () => {
      expect(enforceLazy.isString().maxLength(1).run('hi').passes).toBe(false);
      expect(enforceLazy.isString().maxLength(2).run('hello').passes).toBe(false);
    });
  });

  describe('lengthEquals', () => {
    it('passes when string length equals the specified value', () => {
      expect(enforceLazy.isString().lengthEquals(5).run('hello').passes).toBe(true);
      expect(enforceLazy.isString().lengthEquals(0).run('').passes).toBe(true);
      expect(enforceLazy.isString().lengthEquals(3).run('abc').passes).toBe(true);
    });

    it('fails when string length does not equal the specified value', () => {
      expect(enforceLazy.isString().lengthEquals(3).run('hello').passes).toBe(false);
      expect(enforceLazy.isString().lengthEquals(1).run('').passes).toBe(false);
    });
  });

  describe('lengthNotEquals', () => {
    it('passes when string length does not equal the specified value', () => {
      expect(enforceLazy.isString().lengthNotEquals(3).run('hello').passes).toBe(true);
      expect(enforceLazy.isString().lengthNotEquals(1).run('').passes).toBe(true);
    });

    it('fails when string length equals the specified value', () => {
      expect(enforceLazy.isString().lengthNotEquals(5).run('hello').passes).toBe(false);
      expect(enforceLazy.isString().lengthNotEquals(0).run('').passes).toBe(false);
    });
  });
});
