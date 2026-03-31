import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

describe('enforce.record()', () => {
  describe('lazy', () => {
    it('should return a rule instance', () => {
      const rule = enforce.record(enforce.isNumber());
      expect(rule).toHaveProperty('run');
      expect(rule).toHaveProperty('infer');
    });

    describe('value-only validation', () => {
      it('passes when all values match rule', () => {
        const rule = enforce.record(enforce.isNumber());
        expect(rule.run({ a: 1, b: 2, c: 3 }).pass).toBe(true);
      });

      it('fails when any value does not match', () => {
        const rule = enforce.record(enforce.isNumber());
        expect(rule.run({ a: 1, b: 'two', c: 3 } as any).pass).toBe(false);
      });

      it('passes for empty objects', () => {
        const rule = enforce.record(enforce.isNumber());
        expect(rule.run({}).pass).toBe(true);
      });

      it('fails for non-object values', () => {
        const rule = enforce.record(enforce.isNumber());
        expect(rule.run('not an object' as any).pass).toBe(false);
      });

      it('fails for arrays', () => {
        const rule = enforce.record(enforce.isNumber());
        expect(rule.run([1, 2, 3] as any).pass).toBe(false);
      });

      it('skips prototype keys', () => {
        const obj = Object.create({ inherited: 'bad' });
        obj.own = 42;
        const rule = enforce.record(enforce.isNumber());
        expect(rule.run(obj).pass).toBe(true);
      });

      it('fails on prototype pollution keys', () => {
        const rule = enforce.record(enforce.isNumber());
        const polluter = JSON.parse('{"__proto__": {"malicious": true}}');
        const res = rule.run(polluter);
        expect(res.pass).toBe(false);
        expect(res.path).toEqual(['__proto__']);
      });
    });

    describe('key + value validation', () => {
      it('validates both keys and values', () => {
        const rule = enforce.record(
          enforce.isString().matches(/^[a-z]+$/),
          enforce.isNumber(),
        );
        expect(rule.run({ abc: 1, def: 2 }).pass).toBe(true);
      });

      it('fails when key does not match', () => {
        const rule = enforce.record(
          enforce.isString().matches(/^[a-z]+$/),
          enforce.isNumber(),
        );
        const res = rule.run({ INVALID: 1 });
        expect(res.pass).toBe(false);
        expect(res.path).toEqual(['INVALID']);
      });

      it('fails when value does not match', () => {
        const rule = enforce.record(
          enforce.isString().matches(/^[a-z]+$/),
          enforce.isNumber(),
        );
        const res = rule.run({ valid: 'text' } as any);
        expect(res.pass).toBe(false);
        expect(res.path).toEqual(['valid']);
      });
    });

    describe('nested schemas', () => {
      it('validates nested shapes as values', () => {
        const rule = enforce.record(
          enforce.shape({
            name: enforce.isString(),
            age: enforce.isNumber(),
          }),
        );

        expect(
          rule.run({
            user1: { name: 'Alice', age: 30 },
            user2: { name: 'Bob', age: 25 },
          }).pass,
        ).toBe(true);

        const failing = rule.run({
          user1: { name: 'Alice', age: 30 },
          user2: { name: 'Bob', age: '25' },
        } as any);

        expect(failing.pass).toBe(false);
        expect(failing.path).toEqual(['user2', 'age']);
      });

      it('validates nested records', () => {
        const rule = enforce.record(enforce.record(enforce.isBoolean()));

        expect(
          rule.run({
            group1: { a: true, b: false },
            group2: { c: true },
          }).pass,
        ).toBe(true);
      });
    });

    describe('lazy chain type tests', () => {
      it('works with .test()', () => {
        const rule = enforce.record(enforce.isString());
        expect(rule.test({ a: 'hello' })).toBe(true);
      });

      it('chains with message() correctly', () => {
        const rule = enforce.record(enforce.isNumber().message('custom error'));
        const result = rule.run({ a: 1, b: 'err' });
        expect(result.pass).toBe(false);
        expect(result.message).toEqual('custom error');
      });
    });
  });

  describe('eager', () => {
    describe('value-only validation', () => {
      it('passes when all values match rule', () => {
        expect(() => {
          enforce({ a: 1, b: 2, c: 3 }).record(enforce.isNumber());
        }).not.toThrow();
      });

      it('fails when any value does not match', () => {
        expect(() => {
          enforce({ a: 1, b: 'two', c: 3 }).record(enforce.isNumber());
        }).toThrow();
      });

      it('passes for empty objects', () => {
        expect(() => {
          enforce({}).record(enforce.isNumber());
        }).not.toThrow();
      });

      it('fails for non-object values', () => {
        expect(() => {
          (enforce('not an object') as any).record(enforce.isNumber());
        }).toThrow();
      });

      it('fails for arrays', () => {
        expect(() => {
          (enforce([1, 2, 3]) as any).record(enforce.isNumber());
        }).toThrow();
      });

      it('skips prototype keys', () => {
        const obj = Object.create({ inherited: 'bad' });
        obj.own = 42;
        expect(() => {
          enforce(obj).record(enforce.isNumber());
        }).not.toThrow();
      });
    });

    describe('key + value validation', () => {
      it('validates both keys and values', () => {
        expect(() => {
          enforce({ abc: 1, def: 2 }).record(
            enforce.isString().matches(/^[a-z]+$/),
            enforce.isNumber(),
          );
        }).not.toThrow();
      });

      it('fails when key does not match', () => {
        expect(() => {
          enforce({ INVALID: 1 }).record(
            enforce.isString().matches(/^[a-z]+$/),
            enforce.isNumber(),
          );
        }).toThrow();
      });
    });
  });
});
