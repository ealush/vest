import { describe, expect, it } from 'vitest';

import { enforce, runSchemaPaths } from '../../n4s';

describe('runSchemaPaths flat execution projection', () => {
  it('does not execute a dependency source when only the target changed', () => {
    const calls: string[] = [];
    const schema = enforce.shape({
      country: enforce.condition(value => {
        calls.push(`country:${String(value)}`);
        return typeof value === 'string';
      }),
      state: enforce
        .condition(value => {
          calls.push(`state:${String(value)}`);
          return typeof value === 'string';
        })
        .dependsOn($ => $.country),
    });

    const result = runSchemaPaths(
      schema,
      { country: 'US', state: 'NY' },
      { affected: ['state'] },
    );

    expect(result.every(entry => entry.pass)).toBe(true);
    expect(calls).toEqual(['state:NY']);
  });

  it('executes a changed source and its direct dependent exactly once', () => {
    const calls: string[] = [];
    const schema = enforce.shape({
      country: enforce.condition(value => {
        calls.push(`country:${String(value)}`);
        return typeof value === 'string';
      }),
      state: enforce
        .condition(value => {
          calls.push(`state:${String(value)}`);
          return typeof value === 'string';
        })
        .dependsOn($ => $.country),
      email: enforce.condition(value => {
        calls.push(`email:${String(value)}`);
        return typeof value === 'string';
      }),
    });

    runSchemaPaths(
      schema,
      { country: 'US', state: 'NY', email: 'a@example.com' },
      { affected: ['country'] },
    );

    expect(calls).toEqual(['country:US', 'state:NY']);
  });

  it('keeps dependency fan-out non-transitive', () => {
    const calls: string[] = [];
    const schema = enforce.shape({
      a: enforce.condition(value => {
        calls.push(`a:${String(value)}`);
        return true;
      }),
      b: enforce
        .condition(value => {
          calls.push(`b:${String(value)}`);
          return true;
        })
        .dependsOn($ => $.a),
      c: enforce
        .condition(value => {
          calls.push(`c:${String(value)}`);
          return true;
        })
        .dependsOn($ => $.b),
    });

    runSchemaPaths(schema, { a: 'a', b: 'b', c: 'c' }, { affected: ['a'] });

    expect(calls).toEqual(['a:a', 'b:b']);
  });

  it('deduplicates a flat cycle without recursing', () => {
    const calls: string[] = [];
    const schema = enforce.shape({
      a: enforce
        .condition(value => {
          calls.push(`a:${String(value)}`);
          return true;
        })
        .dependsOn($ => $.b),
      b: enforce
        .condition(value => {
          calls.push(`b:${String(value)}`);
          return true;
        })
        .dependsOn($ => $.a),
    });

    runSchemaPaths(schema, { a: 'a', b: 'b' }, { affected: ['a'] });

    expect(calls).toEqual(['a:a', 'b:b']);
  });

  it('lets only() narrow the dependency-aware affected set', () => {
    const calls: string[] = [];
    const schema = enforce.shape({
      a: enforce.condition(() => {
        calls.push('a');
        return true;
      }),
      b: enforce
        .condition(() => {
          calls.push('b');
          return true;
        })
        .dependsOn($ => $.a),
    });

    runSchemaPaths(
      schema,
      { a: 'a', b: 'b' },
      { affected: ['a'], only: ['a'] },
    );

    expect(calls).toEqual(['a']);
  });

  it('still applies parser chains to affected members', () => {
    const schema = enforce.shape({
      age: enforce.isNumeric().toNumber(),
      note: enforce.isString(),
    });

    const result = runSchemaPaths(
      schema,
      { age: '42', note: 'unchanged' },
      { affected: ['age'] },
    );

    expect(result).toHaveLength(1);
    expect(result[0].pass).toBe(true);
    expect(result[0].type).toEqual({ age: 42, note: 'unchanged' });
  });
});
