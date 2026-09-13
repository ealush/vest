import { describe, expect, it, vi } from 'vitest';

import { compose, enforce } from '../../n4s';
import { resolveAffectedPaths, runSchemaPaths } from '../selectiveRun';

const roots = ['shape', 'loose', 'partial', 'compose'] as const;

describe('schema contracts: execution coverage and paths', () => {
  it.each(
    roots.flatMap(root =>
      [false, true].map(selectedPass => ({ root, selectedPass })),
    ),
  )(
    '[SC-COVERAGE] $root visits a selected member hidden after an unrelated first failure (pass=$selectedPass)',
    ({ root, selectedPass }) => {
      const before = vi.fn(() => false);
      const selected = vi.fn(() => selectedPass);
      const members = {
        a: enforce.condition(before),
        b: enforce.condition(selected),
      };
      const schema =
        root === 'compose'
          ? compose(
              enforce.shape(members),
              enforce.condition(() => true),
            )
          : enforce[root](members);
      const results = runSchemaPaths(
        schema,
        { a: 'bad', b: 'selected' },
        { affected: ['b'] },
      );
      expect(selected).toHaveBeenCalledExactlyOnceWith('selected');
      expect(before.mock.calls.length).toBeLessThanOrEqual(1);
      expect(results.some(result => !result.pass)).toBe(!selectedPass);
      if (!selectedPass)
        expect(results).toContainEqual(
          expect.objectContaining({ pass: false, path: ['b'] }),
        );
    },
  );

  it('[SC-ONCE] a failed predicate is not retried into a passing verdict', () => {
    const predicate = vi.fn().mockReturnValueOnce(false).mockReturnValue(true);
    const results = runSchemaPaths(
      enforce.shape({ a: enforce.condition(predicate) }),
      { a: 1 },
      { affected: ['a'] },
    );
    expect(predicate).toHaveBeenCalledTimes(1);
    expect(results.some(result => !result.pass)).toBe(true);
  });

  it('[SC-EXCLUDE] a skipped leaf under an affected parent is never executed', () => {
    const a = vi.fn(() => false);
    const b = vi.fn(() => true);
    const schema = enforce.shape({
      p: enforce.shape({ a: enforce.condition(a), b: enforce.condition(b) }),
    });
    const results = runSchemaPaths(
      schema,
      { p: { a: 'skip', b: 'run' } },
      { affected: ['p'], skip: ['p.a'] },
    );
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledTimes(1);
    expect(results.every(result => result.pass)).toBe(true);
  });

  it.each(['01', '1', '9007199254740993'])(
    '[SC-PATH] record key %s is not numerically conflated with another key',
    key => {
      const schema = enforce.shape({
        dict: enforce.record(enforce.isString().isNotBlank()),
      });
      const data = {
        dict: { '1': 'ok', '01': 'ok', '9007199254740992': 'ok', [key]: '' },
      };
      expect(
        runSchemaPaths(schema, data, { affected: [`dict.${key}`] }),
      ).toContainEqual(
        expect.objectContaining({ pass: false, path: ['dict', key] }),
      );
    },
  );

  it.each(['array', 'record'] as const)(
    '[SC-SCOPE] %s sibling dependencies bind within one concrete item; root sources fan out',
    kind => {
      const item = enforce.shape({
        country: enforce.isString(),
        passport: enforce.isString().dependsOn($ => [$.country, $.root.policy]),
      });
      const schema = enforce.shape({
        policy: enforce.isString(),
        rows: kind === 'array' ? enforce.isArrayOf(item) : enforce.record(item),
      });
      const rows =
        kind === 'array'
          ? [
              { country: 'A', passport: 'x' },
              { country: 'B', passport: 'y' },
            ]
          : {
              first: { country: 'A', passport: 'x' },
              second: { country: 'B', passport: 'y' },
            };
      const keys = kind === 'array' ? ['0', '1'] : ['first', 'second'];
      const data = { policy: 'ok', rows };
      expect(
        resolveAffectedPaths(schema, [`rows.${keys[1]}.country`], data).sort(),
      ).toEqual([`rows.${keys[1]}.country`, `rows.${keys[1]}.passport`].sort());
      expect(resolveAffectedPaths(schema, ['policy'], data).sort()).toEqual(
        ['policy', ...keys.map(key => `rows.${key}.passport`)].sort(),
      );
    },
  );

  it('[SC-SCOPE] editing a descendant invalidates its aggregate consumer', () => {
    const schema = enforce.shape({
      p: enforce.shape({ a: enforce.isString() }),
      summary: enforce.isString().dependsOn($ => $.p),
    });
    expect(resolveAffectedPaths(schema, ['p.a'])).toEqual(['p.a', 'summary']);
  });

  it('[SC-SCOPE] planning never evaluates validators, parsers, or input getters unrelated to collection expansion', () => {
    const predicate = vi.fn(() => true);
    const getter = vi.fn(() => 'value');
    const schema = enforce.shape({
      a: enforce.condition(predicate),
      b: enforce.isString().dependsOn($ => $.a),
    });
    const data = Object.defineProperty({ b: 'ok' }, 'a', {
      get: getter,
      enumerable: true,
    });
    schema.describe();
    resolveAffectedPaths(schema, ['a'], data);
    expect(predicate).not.toHaveBeenCalled();
    expect(getter).not.toHaveBeenCalled();
  });

  it('[SC-SCOPE] projection privileges do not leak into a nested schema constructed by a validator', () => {
    const schema = enforce.shape({
      a: enforce.condition(() => {
        enforce.shape({ x: enforce.isString().dependsOn($ => $.missing) });
        return true;
      }),
    });
    expect(
      runSchemaPaths(schema, { a: 1 }, { affected: ['a'] }).some(
        result => !result.pass,
      ),
    ).toBe(true);
    expect(() =>
      enforce.shape({ x: enforce.isString().dependsOn($ => $.missing) }),
    ).toThrow();
  });
});
