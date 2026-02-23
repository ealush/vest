import { describe, it, expect, vi } from 'vitest';

import { RuleRunReturn } from '../RuleRunReturn';

describe('RuleRunReturn', () => {
  describe('create with boolean', () => {
    it('returns pass/type/message when message is string', () => {
      const res = RuleRunReturn.create(true, 'TYPE', 'ok');
      expect(res.pass).toBe(true);
      expect(res.type).toBe('TYPE');
      expect(res.message).toBe('ok');
    });

    it('invokes message function with type and sets pass=false', () => {
      const msgFn = vi.fn((t: number) => `msg:${t}`);
      const res = RuleRunReturn.create<number>(false, 123, msgFn);
      expect(res.pass).toBe(false);
      expect(res.type).toBe(123);
      expect(res.message).toBe('msg:123');
      expect(msgFn).toHaveBeenCalledTimes(1);
      expect(msgFn).toHaveBeenCalledWith(123);
    });

    it('keeps message undefined when not provided', () => {
      const res = RuleRunReturn.create(true, 'TYP');
      expect(res.pass).toBe(true);
      expect(res.type).toBe('TYP');
      expect(res.message).toBeUndefined();
    });
  });

  describe('create with RuleRunReturn', () => {
    it('clones values and invokes message function with the original type', () => {
      const base = RuleRunReturn.Failing('T', (t: string) => `fail:${t}`);
      const cloned = RuleRunReturn.create(base, 'T');

      expect(cloned.pass).toBe(false);
      expect(cloned.type).toBe('T');
      expect(cloned.message).toBe('fail:T');
    });

    it('uses pass from inner; explicit type/message take precedence', () => {
      const inner = RuleRunReturn.Failing('INNER', 'inner');
      const res = RuleRunReturn.create(inner, 'OUTER', 'outer');

      expect(res.pass).toBe(false);
      expect(res.type).toBe('OUTER');
      // explicit message is preferred over inner
      expect(res.message).toBe('outer');
    });

    it('falls back to provided type when inner type is undefined', () => {
      const inner = new (RuleRunReturn as any)(
        false,
        undefined,
        'm',
      ) as RuleRunReturn<any>;
      const res = RuleRunReturn.create(inner, 'FALLBACK', 'outer');
      expect(res.pass).toBe(false);
      expect(res.type).toBe('FALLBACK');
      // explicit message is used when provided
      expect(res.message).toBe('outer');
    });

    it('falls back to provided type when inner passing type is undefined', () => {
      const inner = new (RuleRunReturn as any)(
        true,
        undefined,
      ) as RuleRunReturn<any>;
      const res = RuleRunReturn.create(inner, 'FALLBACK');

      expect(res.pass).toBe(true);
      expect(res.type).toBe('FALLBACK');
    });

    it('invokes provided message function with provided type argument', () => {
      const inner = RuleRunReturn.Passing('INNER');
      const msgFn = vi.fn((t: string) => `outer:${t}`);
      const res = RuleRunReturn.create(inner, 'OUTER', msgFn);

      // final type preserves inner transformed type on pass
      expect(res.type).toBe('INNER');
      // message function receives the second arg to create (OUTER)
      expect(res.message).toBe('outer:OUTER');
      expect(msgFn).toHaveBeenCalledTimes(1);
      expect(msgFn).toHaveBeenCalledWith('OUTER');
    });
  });

  describe('Passing/Failing helpers', () => {
    it('Passing returns pass=true with string or function message', () => {
      const r1 = RuleRunReturn.Passing('X', 'ok');
      expect(r1.pass).toBe(true);
      expect(r1.type).toBe('X');
      expect(r1.message).toBe('ok');

      const r2 = RuleRunReturn.Passing('Y', (t: string) => `yay:${t}`);
      expect(r2.pass).toBe(true);
      expect(r2.type).toBe('Y');
      expect(r2.message).toBe('yay:Y');
    });

    it('Failing returns pass=false with string or function message', () => {
      const r1 = RuleRunReturn.Failing('X', 'nope');
      expect(r1.pass).toBe(false);
      expect(r1.type).toBe('X');
      expect(r1.message).toBe('nope');

      const r2 = RuleRunReturn.Failing('Y', (t: string) => `nay:${t}`);
      expect(r2.pass).toBe(false);
      expect(r2.type).toBe('Y');
      expect(r2.message).toBe('nay:Y');
    });
  });
});
