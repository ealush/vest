import { describe, expect, it, vi } from 'vitest';

import { SuiteSerializer } from '../../exports/SuiteSerializer';
import { create, enforce, test } from '../../vest';
import type { SuiteModifiers } from '../SuiteTypes';

const valid = { a: 'x', n: '42' };
const invalid = { a: 'x', n: 'bad' };

function createSuite() {
  return create(
    () => test('a', () => true),
    enforce.shape({ a: enforce.isString(), n: enforce.isNumeric().toNumber() }),
  );
}

describe('unvalidated schema fields outside a focused run (#1367)', () => {
  it.each<SuiteModifiers<'a' | 'n'>>([
    { skip: 'n' },
    { only: 'a' },
    { only: ['a', 'n'], skip: 'n' },
  ])('keep a fresh suite incomplete with focus %j', focus => {
    const result = createSuite().focus(focus).run(invalid);

    expect(result.valid).toBe(false);
    expect(result.isValid()).toBe(false);
    expect(result.hasErrors()).toBe(false);
    expect(result.hasErrors('n')).toBe(false);
    expect(result.isPending()).toBe(false);
    expect(result.isTested('n')).toBe(false);
    expect(result.value).toBeUndefined();
  });

  it('keeps only() runs incomplete until the omitted field is validated', () => {
    const suite = createSuite();

    expect(suite.only('a').run(invalid).valid).toBe(false);
    expect(suite.only('a').run(invalid).valid).toBe(false);
    expect(suite.only('n').run(valid).valid).toBe(true);
    expect(suite.only('a').run(invalid).valid).toBe(true);
  });

  it('does not mark a fresh focused run incomplete when excluded input passes', () => {
    expect(createSuite().only('a').run(valid).valid).toBe(true);
  });

  it('retains successful completeness checks on later focused runs', () => {
    const suite = createSuite();
    expect(suite.only('a').run(valid).valid).toBe(true);
    expect(suite.only('a').run(invalid).valid).toBe(true);
  });

  it('retains an earlier successful full-schema verdict', () => {
    const suite = createSuite();
    expect(suite.run(valid).valid).toBe(true);

    const result = suite.only('a').run(invalid);
    expect(result.valid).toBe(true);
    expect(result.hasErrors('n')).toBe(false);
  });

  it('retains an earlier focused schema verdict', () => {
    const suite = createSuite();
    suite.only('n').run(valid);

    expect(suite.only('a').run(invalid).valid).toBe(true);
  });

  it('retains an earlier failing verdict without duplicating its error', () => {
    const suite = createSuite();
    suite.run(invalid);

    const result = suite.only('a').run(valid);
    expect(result.valid).toBe(false);
    expect(result.tests.n.errorCount).toBe(1);
  });

  it.each(['reset', 'resetField', 'remove'] as const)(
    'forgets a previous schema verdict after %s',
    action => {
      const suite = createSuite();
      suite.run(valid);
      if (action === 'reset') suite.reset();
      else suite[action]('n');

      const result = suite.only('a').run(invalid);
      expect(result.valid).toBe(false);
      expect(result.hasErrors('n')).toBe(false);
    },
  );

  it('recovers after a full successful validation', () => {
    const suite = createSuite();
    suite.only('a').run(invalid);

    expect(suite.run(valid).valid).toBe(true);
    expect(suite.only('a').run(invalid).valid).toBe(true);
  });

  it.each([false, true])(
    'preserves recorded schema verdicts across serialization (validated: %s)',
    validated => {
      const source = createSuite();
      if (validated) source.run(valid);
      else source.only('a').run(invalid);

      const restored = createSuite();
      SuiteSerializer.resume(restored, SuiteSerializer.serialize(source));
      const result = restored.only('a').run(invalid);

      expect(result.valid).toBe(validated);
      expect(result.hasErrors('n')).toBe(false);
    },
  );

  it('tracks excluded nested schema failures without reporting them', () => {
    const suite = create(
      () => test('a', () => true),
      enforce.shape({
        a: enforce.isString(),
        box: enforce.shape({ n: enforce.isNumeric().toNumber() }),
      }),
    );

    const result = suite.only('a').run({ a: 'x', box: { n: 'bad' } });
    expect(result.valid).toBe(false);
    expect(result.hasErrors()).toBe(false);
  });

  it('keeps async completion from making an unchecked schema field valid', async () => {
    const suite = create(
      () => test('a', async () => {}),
      enforce.shape({ a: enforce.isString(), n: enforce.isNumeric() }),
    );

    const result = await suite.only('a').run(invalid);
    expect(result.valid).toBe(false);
    expect(result.hasErrors()).toBe(false);
  });

  it('does not execute an excluded user test while checking schema completeness', () => {
    const excluded = vi.fn();
    const suite = create(
      () => {
        test('a', () => true);
        test('n', excluded);
      },
      enforce.shape({ a: enforce.isString(), n: enforce.isNumeric() }),
    );

    expect(suite.only('a').run(invalid).valid).toBe(false);
    expect(excluded).not.toHaveBeenCalled();
  });

  it('does not mistake a passing user test for a schema verdict', () => {
    const suite = create(
      () => {
        test('a', () => true);
        test('n', () => true);
      },
      enforce.shape({ a: enforce.isString(), n: enforce.isNumeric() }),
    );
    // The initial schema fails at a before reaching n; its user test still passes.
    suite.run({ a: 1, n: 'bad' } as never);

    const result = suite.only('a').run(invalid);
    expect(result.valid).toBe(false);
    expect(result.hasErrors()).toBe(false);
  });

  it('does not rerun an excluded schema rule with a recorded verdict', () => {
    const check = vi.fn(() => true);
    const suite = create(
      () => test('a', () => true),
      enforce.shape({ a: enforce.isString(), n: enforce.condition(check) }),
    );
    suite.run(valid);
    check.mockClear();

    suite.only('a').run(invalid);
    expect(check).not.toHaveBeenCalled();
  });

  it('does not probe excluded rules when the focused schema already fails', () => {
    const check = vi.fn(() => true);
    const suite = create(
      () => test('a', () => true),
      enforce.shape({ a: enforce.isString(), n: enforce.condition(check) }),
    );

    expect(suite.only('a').run({ a: 1, n: 'bad' } as never).valid).toBe(false);
    expect(check).not.toHaveBeenCalled();
  });

  it('checks the remaining unknown fields after a focused field recovers', () => {
    const suite = create(
      () => test('a', () => true),
      enforce.shape({
        a: enforce.isString(),
        n: enforce.isNumeric(),
        other: enforce.isNumeric(),
      }),
    );

    expect(suite.only('a').run({ ...invalid, other: 'bad' }).valid).toBe(false);
    const result = suite.only('n').run({ ...valid, other: 'bad' });
    expect(result.valid).toBe(false);
    expect(result.hasErrors()).toBe(false);
    expect(suite.only('other').run({ ...valid, other: '7' }).valid).toBe(true);
  });

  it.each(['a.b', '__root__'])(
    'handles an excluded literal schema field named %s',
    field => {
      const suite = create(
        () => test('a', () => true),
        enforce.shape({ a: enforce.isString(), [field]: enforce.isNumeric() }),
      );

      const result = suite.only('a').run({ a: 'x', [field]: 'bad' });
      expect(result.valid).toBe(false);
      expect(result.hasErrors()).toBe(false);
    },
  );

  it('forgets a nested schema verdict when a descendant is reset', () => {
    const suite = create(
      () => test('a', () => true),
      enforce.shape({
        a: enforce.isString(),
        box: enforce.shape({ n: enforce.isNumeric() }),
      }),
    );
    suite.run({ a: 'x', box: { n: '42' } });
    // @ts-expect-error - Nested schema failures use dotted field names at runtime.
    suite.resetField('box.n');

    expect(suite.only('a').run({ a: 'x', box: { n: 'bad' } }).valid).toBe(
      false,
    );
  });

  it.each([false, true])(
    'resetting a literal dotted field preserves its prefix verdict (validated: %s)',
    validated => {
      const suite = create(
        () => test('other', () => true),
        enforce.shape({
          a: enforce.isNumeric(),
          'a.b': enforce.isNumeric(),
          other: enforce.isString(),
        }),
      );
      const data = { a: '42', 'a.b': '7', other: 'x' };
      if (validated) suite.run(data);
      else suite.only(['a', 'other']).run({ ...data, 'a.b': 'bad' });
      suite.resetField('a.b');

      const result = suite.only(['a.b', 'other']).run({ ...data, a: 'bad' });
      expect(result.valid).toBe(true);
      expect(result.hasErrors()).toBe(false);
    },
  );
});
