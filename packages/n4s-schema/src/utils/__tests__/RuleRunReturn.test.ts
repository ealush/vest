import { describe, it, expect, vi } from 'vitest';

import { RuleRunReturn } from '../RuleRunReturn';

describe('RuleRunReturn', () => {
  describe('fromBoolean', () => {
    it('returns pass/type/message when message is string', () => {
      const res = RuleRunReturn.fromBoolean(true, 'TYPE', 'ok');
      expect(res.pass).toBe(true);
      expect(res.type).toBe('TYPE');
      expect(res.message).toBe('ok');
    });

    it('invokes message function with type and sets pass=false', () => {
      const msgFn = vi.fn((t: number) => `msg:${t}`);
      const res = RuleRunReturn.fromBoolean<number>(false, 123, msgFn);
      expect(res.pass).toBe(false);
      expect(res.type).toBe(123);
      expect(res.message).toBe('msg:123');
      expect(msgFn).toHaveBeenCalledTimes(1);
      expect(msgFn).toHaveBeenCalledWith(123);
    });

    it('keeps message undefined when not provided', () => {
      const res = RuleRunReturn.fromBoolean(true, 'TYP');
      expect(res.pass).toBe(true);
      expect(res.type).toBe('TYP');
      expect(res.message).toBeUndefined();
    });
  });

  describe('create with RuleRunReturn input', () => {
    it('uses pass/type from provided object and keeps its string message', () => {
      const inner = RuleRunReturn.Failing('INNER', 'inner');
      const res = RuleRunReturn.create(inner, 'OUTER', 'outer');

      expect(res.pass).toBe(false);
      expect(res.type).toBe('INNER');
      // when inner has its own message, it is preferred over provided one
      expect(res.message).toBe('inner');
    });

    it('falls back to provided type when inner type is undefined', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const inner = new (RuleRunReturn as any)(
        false,
        undefined,
        'm',
      ) as RuleRunReturn<any>;
      const res = RuleRunReturn.create(inner, 'FALLBACK', 'outer');
      expect(res.pass).toBe(false);
      expect(res.type).toBe('FALLBACK');
      // message comes from inner and remains unchanged
      expect(res.message).toBe('m');
    });

    it('invokes provided message function with provided type argument', () => {
      const inner = RuleRunReturn.Passing('INNER');
      const msgFn = vi.fn((t: string) => `outer:${t}`);
      const res = RuleRunReturn.create(inner, 'OUTER', msgFn);

      // final type prefers inner.type
      expect(res.type).toBe('INNER');
      // message function receives the second arg to create (OUTER)
      expect(res.message).toBe('outer:OUTER');
      expect(msgFn).toHaveBeenCalledTimes(1);
      expect(msgFn).toHaveBeenCalledWith('OUTER');
    });
  });

  describe('fromRuleRunReturn', () => {
    it('clones values and invokes message function with the original type', () => {
      const base = RuleRunReturn.Failing('T', (t: string) => `fail:${t}`);
      const cloned = RuleRunReturn.fromRuleRunReturn(base);

      expect(cloned.pass).toBe(false);
      expect(cloned.type).toBe('T');
      expect(cloned.message).toBe('fail:T');
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
