import { describe, expect, it } from 'vitest';
import { compose, enforce } from 'n4s';

import type { TFieldName } from '../../suiteResult/SuiteResultTypes';
import { create, test } from '../../vest';
import { invokeWithUnknown } from '../../__tests__/runtimeTestUtils';

declare global {
  namespace n4s {
    interface EnforceMatchers {
      round2NullRoot: (value: unknown) => { pass: boolean; type: null };
    }
  }
}

/**
 * Round-2 adversarial contracts (vest-Round-2 evidence bundle).
 * Each test asserts the REQUIRED result; all fail on the reviewed head.
 * No production code was changed to make these convenient.
 */
describe('round 2 regression contracts', () => {
  describe('F1 — inclusion focus retains untouched schema errors', () => {
    it('keeps the prior `a` schema error across suite.only(b)', () => {
      const schema = enforce.shape({
        a: enforce.isString().isNotBlank(),
        b: enforce.isString(),
      });
      const suite = create(() => {
        test('b', () => true);
      }, schema);

      const before = suite.run({ a: '', b: 'ok' });
      expect(before.isValid()).toBe(false);

      const after = suite.only('b').run({ a: '', b: 'new' });
      expect(after.hasErrors('a')).toBe(true);
      expect(after.isValid()).toBe(false);
    });
  });

  describe('F2 — composed fallback visits the selected invalid field', () => {
    it('evaluates `b` instead of certifying success from an unrelated failure', () => {
      const calls: string[] = [];
      const schema = compose(
        enforce.shape({
          a: enforce.condition(() => {
            calls.push('a');
            return false;
          }),
          b: enforce.condition(() => {
            calls.push('b');
            return false;
          }),
        }),
        enforce.condition(() => false),
      );
      const suite = create(() => {
        test('b', () => true);
      }, schema);

      const result = suite.changed('b').run({ a: 'x', b: 'y' });

      expect(calls).toContain('b');
      expect(result.isValid()).toBe(false);
    });
  });

  describe('F3 — selected union parsing keeps its successful output', () => {
    it('maps focused union members instead of leaving raw strings', () => {
      const schema = enforce.shape({
        rows: enforce.isArrayOf(
          enforce.isNumeric().toNumber(),
          enforce.isBoolean(),
        ),
        note: enforce.isString(),
      });
      let seen: unknown;
      const suite = create(data => {
        seen = data;
        test('rows.0' as TFieldName, () => true);
      }, schema);

      suite.run({ rows: ['1', '3'], note: 'old' });
      const result = suite
        .changed('rows.0')
        .run({ rows: ['2', '3'], note: 'old' });

      expect(seen).toEqual({ rows: [2, 3], note: 'old' });
      expect(result.isValid()).toBe(true);
      expect(result.value).toEqual({ rows: [2, 3], note: 'old' });
    });
  });

  describe('F4 — valid null output is preserved, not replaced by raw input', () => {
    it('delivers null through the callback and the result value', () => {
      enforce.extend(
        {
          round2NullRoot: () => ({ pass: true, type: null }),
        },
        { parsers: ['round2NullRoot'] },
      );
      const schema = enforce.round2NullRoot();
      let seen: unknown = 'unset';
      const suite = create(data => {
        seen = data;
        test('x', () => true);
      }, schema);

      expect(schema.run('raw')).toEqual(
        expect.objectContaining({ pass: true, type: null }),
      );
      const result = suite.run('raw');

      expect(Object.is(seen, null)).toBe(true);
      expect(Object.is(result.value, null)).toBe(true);
    });
  });

  describe('F5 — a real `__root__` field never collides with global errors', () => {
    it('retains the `__root__` failure across an unrelated change', () => {
      const schema = enforce.shape({
        __root__: enforce.isString().isNotBlank(),
        b: enforce.isString(),
      });
      const suite = create(() => {
        test('b', () => true);
      }, schema);

      const before = suite.run({ __root__: '', b: 'ok' });
      expect(before.isValid()).toBe(false);

      const after = suite.changed('b').run({ __root__: '', b: 'next' });
      expect(after.isValid()).toBe(false);
      expect(Object.keys(after.getErrors())).toContain('__root__');
    });
  });

  describe('F6 — subtree invalidation selects descendant user tests', () => {
    it('executes test `p.a` when `p` changes', () => {
      const calls: string[] = [];
      const schema = enforce.shape({
        p: enforce.shape({ a: enforce.isString() }),
      });
      const suite = create(() => {
        test('p.a' as TFieldName, () => {
          calls.push('p.a');
          return false;
        });
      }, schema);

      suite.changed('p').run({ p: { a: 'ok' } });

      expect(calls).toEqual(['p.a']);
    });

    it('executes test `p.a` when a dependency expands to the `p` subtree', () => {
      const calls: unknown[] = [];
      const schema = enforce.shape({
        source: enforce.isString(),
        p: enforce.shape({ a: enforce.isString() }).dependsOn($ => $.source),
      });
      const suite = create(data => {
        test('p.a' as TFieldName, () => {
          calls.push(data.p.a);
          return false;
        });
      }, schema);

      suite
        .changed('source')
        .run({ source: 'new', p: { a: 'invalid-by-user-test' } });

      expect(calls).toHaveLength(1);
    });

    it('refreshes a retained failure once the child is fixed', () => {
      const schema = enforce.shape({
        p: enforce.shape({ a: enforce.isString() }),
        other: enforce.isString(),
      });
      const suite = create(data => {
        test('p.a' as TFieldName, () => data.p.a === 'ok');
        test('other', () => true);
      }, schema);

      suite.run({ p: { a: 'bad' }, other: 'ok' });
      const after = suite.changed('p').run({ p: { a: 'ok' }, other: 'ok' });

      expect(after.isValid()).toBe(true);
    });

    it('drops a retained pass once the child breaks', () => {
      const schema = enforce.shape({
        p: enforce.shape({ a: enforce.isString() }),
        other: enforce.isString(),
      });
      const suite = create(data => {
        test('p.a' as TFieldName, () => data.p.a === 'ok');
        test('other', () => true);
      }, schema);

      suite.run({ p: { a: 'ok' }, other: 'ok' });
      const after = suite.changed('p').run({ p: { a: 'bad' }, other: 'ok' });

      expect(after.isValid()).toBe(false);
    });
  });

  describe('F7 — a skipped leaf does not execute under an affected parent', () => {
    it('leaves the `p.a` predicate uncalled', () => {
      const calls: unknown[] = [];
      const schema = enforce.shape({
        p: enforce.shape({
          a: enforce.condition((value: unknown) => {
            calls.push(value);
            return false;
          }),
          b: enforce.isString(),
        }),
      });
      const suite = create(() => {}, schema);

      // Dotted skip paths are runtime vocabulary: probe them through the
      // explicit runtime seam.
      const focused = invokeWithUnknown(suite.changed('p').focus, {
        skip: 'p.a',
      });
      focused.run({ p: { a: 'skipped', b: 'ok' } });

      expect(calls).toEqual([]);
    });
  });

  describe('F8 — snapshots detach accessor-provided objects', () => {
    it('mutating parsed output leaves the original input alone', () => {
      const shared = { n: 1 };
      const raw = {
        get nested() {
          return shared;
        },
      };
      const suite = create(
        () => {
          test('x', () => true);
        },
        enforce.condition(() => true),
      );

      const result = suite.run(raw);
      const parsed = result.run.data.parsed as { nested: { n: number } };
      parsed.nested.n = 2;

      expect(parsed.nested.n).toBe(2);
      expect(raw.nested.n).toBe(1);
    });
  });
});
