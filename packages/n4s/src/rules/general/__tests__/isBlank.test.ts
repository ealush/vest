import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

describe('isBlank', () => {
  describe('strings', () => {
    it('pass for empty strings', () => {
      expect(enforce.isBlank().run('').pass).toBe(true);
    });

    it('pass for whitespace-only strings', () => {
      expect(enforce.isBlank().run(' ').pass).toBe(true);
      expect(enforce.isBlank().run('  ').pass).toBe(true);
      expect(enforce.isBlank().run('\t').pass).toBe(true);
      expect(enforce.isBlank().run('\n').pass).toBe(true);
      expect(enforce.isBlank().run('\r\n').pass).toBe(true);
      expect(enforce.isBlank().run('   \t  \n  ').pass).toBe(true);
    });

    it('fails for strings with content', () => {
      expect(enforce.isBlank().run('x').pass).toBe(false);
      expect(enforce.isBlank().run(' x ').pass).toBe(false);
      expect(enforce.isBlank().run('hello').pass).toBe(false);
      expect(enforce.isBlank().run('  text  ').pass).toBe(false);
    });
  });

  describe('nullish values', () => {
    it('pass for undefined', () => {
      const value: any = undefined;
      expect(enforce.isBlank().run(value).pass).toBe(true);
    });

    it('pass for null', () => {
      const value: any = null;
      expect(enforce.isBlank().run(value).pass).toBe(true);
    });
  });

  describe('non-blank values', () => {
    it('fails for numbers', () => {
      expect(enforce.isBlank().run(0).pass).toBe(false);
      expect(enforce.isBlank().run(123).pass).toBe(false);
      expect(enforce.isBlank().run(-1).pass).toBe(false);
    });

    it('fails for booleans', () => {
      expect(enforce.isBlank().run(true).pass).toBe(false);
      expect(enforce.isBlank().run(false).pass).toBe(false);
    });

    it('fails for objects', () => {
      expect(enforce.isBlank().run({}).pass).toBe(false);
      expect(enforce.isBlank().run({ a: 1 }).pass).toBe(false);
    });

    it('fails for arrays', () => {
      expect(enforce.isBlank().run([]).pass).toBe(false);
      expect(enforce.isBlank().run([1, 2, 3]).pass).toBe(false);
    });
  });
});

describe('isNotBlank', () => {
  describe('strings', () => {
    it('fails for empty strings', () => {
      expect(enforce.isNotBlank().run('').pass).toBe(false);
    });

    it('fails for whitespace-only strings', () => {
      expect(enforce.isNotBlank().run(' ').pass).toBe(false);
      expect(enforce.isNotBlank().run('  ').pass).toBe(false);
      expect(enforce.isNotBlank().run('\t').pass).toBe(false);
      expect(enforce.isNotBlank().run('\n').pass).toBe(false);
      expect(enforce.isNotBlank().run('\r\n').pass).toBe(false);
      expect(enforce.isNotBlank().run('   \t  \n  ').pass).toBe(false);
    });

    it('pass for strings with content', () => {
      expect(enforce.isNotBlank().run('x').pass).toBe(true);
      expect(enforce.isNotBlank().run(' x ').pass).toBe(true);
      expect(enforce.isNotBlank().run('hello').pass).toBe(true);
      expect(enforce.isNotBlank().run('  text  ').pass).toBe(true);
    });
  });

  describe('nullish values', () => {
    it('fails for undefined', () => {
      const value: any = undefined;
      expect(enforce.isNotBlank().run(value).pass).toBe(false);
    });

    it('fails for null', () => {
      const value: any = null;
      expect(enforce.isNotBlank().run(value).pass).toBe(false);
    });
  });

  describe('non-blank values', () => {
    it('pass for numbers', () => {
      expect(enforce.isNotBlank().run(0).pass).toBe(true);
      expect(enforce.isNotBlank().run(123).pass).toBe(true);
      expect(enforce.isNotBlank().run(-1).pass).toBe(true);
    });

    it('pass for booleans', () => {
      expect(enforce.isNotBlank().run(true).pass).toBe(true);
      expect(enforce.isNotBlank().run(false).pass).toBe(true);
    });

    it('pass for objects', () => {
      expect(enforce.isNotBlank().run({}).pass).toBe(true);
      expect(enforce.isNotBlank().run({ a: 1 }).pass).toBe(true);
    });

    it('pass for arrays', () => {
      expect(enforce.isNotBlank().run([]).pass).toBe(true);
      expect(enforce.isNotBlank().run([1, 2, 3]).pass).toBe(true);
    });
  });
});
