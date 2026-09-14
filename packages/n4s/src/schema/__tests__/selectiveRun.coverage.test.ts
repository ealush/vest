import { describe, expect, it, vi } from 'vitest';

import { compose, enforce } from '../../n4s';
import { resolveAffectedPaths, runSchemaPaths } from '../../exports/internal';

/**
 * Branch coverage for selective-run edge routes. Each case pins observable
 * behavior (call counts, verdicts, error identity), never bare execution.
 */
describe('selectiveRun edge coverage', () => {
  it('skip-all with affected names runs nothing', () => {
    const predicate = vi.fn(() => true);
    const results = runSchemaPaths(
      enforce.shape({ a: enforce.condition(predicate) }),
      { a: 'a' },
      { affected: ['a'], skip: true },
    );
    expect(predicate).not.toHaveBeenCalled();
    expect(results.every(result => result.pass)).toBe(true);
  });

  it('unparseable skip names are ignored without failing', () => {
    const predicate = vi.fn(() => true);
    const results = runSchemaPaths(
      enforce.shape({ a: enforce.condition(predicate) }),
      { a: 'a' },
      { affected: ['a'], skip: ['[[['] },
    );
    expect(predicate).toHaveBeenCalledTimes(1);
    expect(results.every(result => result.pass)).toBe(true);
  });

  it('duplicate exact skips drop the field once', () => {
    const skipped = vi.fn(() => true);
    const selected = vi.fn(() => true);
    runSchemaPaths(
      enforce.shape({
        a: enforce.condition(skipped),
        b: enforce.condition(selected),
      }),
      { a: 'a', b: 'b' },
      { affected: ['a', 'b'], skip: ['a', 'a'] },
    );
    expect(skipped).not.toHaveBeenCalled();
    expect(selected).toHaveBeenCalledTimes(1);
  });

  it('numeric top-level skips do not match object members', () => {
    const selected = vi.fn(() => true);
    const results = runSchemaPaths(
      enforce.shape({ b: enforce.condition(selected) }),
      { b: 'b' },
      { affected: ['b'], skip: ['0'] },
    );
    expect(selected).toHaveBeenCalledTimes(1);
    expect(results.every(result => result.pass)).toBe(true);
  });

  it('disjoint only and affected runs nothing but passes', () => {
    const predicate = vi.fn(() => true);
    const results = runSchemaPaths(
      enforce.shape({ a: enforce.condition(predicate) }),
      { a: 'a' },
      { affected: ['a'], only: ['zzz'] },
    );
    expect(predicate).not.toHaveBeenCalled();
    expect(results.every(result => result.pass)).toBe(true);
  });

  it('non-intersecting skips on composed schemas run everything narrowed', () => {
    const selected = vi.fn(() => true);
    const results = runSchemaPaths(
      compose(
        enforce.shape({ b: enforce.condition(selected) }),
        enforce.condition(() => true),
      ),
      { b: 'b' },
      { affected: ['b'], skip: ['zzz'] },
    );
    expect(selected).toHaveBeenCalledTimes(1);
    expect(results.every(result => result.pass)).toBe(true);
  });

  it('absent required members fail correctly through the supplement', () => {
    const a = vi.fn(() => false);
    const b = vi.fn(() => false);
    const results = runSchemaPaths(
      enforce.shape({
        a: enforce.condition(a),
        b: enforce.condition(b),
      }),
      {},
      { affected: ['a', 'b'] },
    );
    expect(results.some(result => !result.pass)).toBe(true);
    expect(a).toHaveBeenCalled();
    expect(b).toHaveBeenCalled();
  });

  it('partial schemas skip absent members without inventing failures', () => {
    const a = vi.fn(() => false);
    const results = runSchemaPaths(
      enforce.partial({ a: enforce.condition(a) }),
      {},
      { affected: ['a'] },
    );
    expect(results.every(result => result.pass)).toBe(true);
    expect(a).not.toHaveBeenCalled();
  });

  it('present failing members in partial schemas report exactly once', () => {
    const a = vi.fn(() => false);
    const results = runSchemaPaths(
      enforce.partial({ a: enforce.condition(a) }),
      { a: 'bad' },
      { affected: ['a'] },
    );
    expect(results.filter(result => !result.pass)).toHaveLength(1);
    expect(a).toHaveBeenCalledTimes(1);
  });

  it('supplements affected members hidden behind an earlier failure exactly once', () => {
    const calls: string[] = [];
    const member = (field: string) =>
      enforce.condition(() => {
        calls.push(field);
        return false;
      });
    const schema = enforce.shape({ a: member('a'), b: member('b') });
    const failures = runSchemaPaths(
      schema,
      { a: 1, b: 2 },
      { affected: ['a', 'b'] },
    ).filter(result => !result.pass);
    expect(failures.map(result => result.path)).toEqual([['a'], ['b']]);
    expect(calls.filter(call => call === 'a')).toHaveLength(1);
    expect(calls.filter(call => call === 'b')).toHaveLength(1);
  });

  it('runs absent required members standalone instead of inventing pass', () => {
    const b = vi.fn(() => false);
    const failures = runSchemaPaths(
      enforce.shape({
        a: enforce.condition(() => false),
        b: enforce.condition(b),
      }),
      {},
      { affected: ['b'] },
    );
    expect(
      failures.some(result => !result.pass && result.path?.join('.') === 'b'),
    ).toBe(true);
    expect(b).toHaveBeenCalled();
  });

  it('falls back to full execution when a standalone member orphans a root edge', () => {
    const region = vi.fn(() => true);
    const tax = vi.fn(() => true);
    const schema = compose(
      enforce.shape({
        region: enforce.condition(region),
        travelers: enforce.isArrayOf(
          enforce.shape({
            country: enforce.isString(),
            tax: enforce.condition(tax).dependsOn($ => $.root.region),
          }),
        ),
      }),
      enforce.condition(() => true),
    );
    const data = {
      region: 'ok',
      travelers: [{ country: 'A', tax: 't' }],
    };
    const results = runSchemaPaths(schema, data, {
      affected: ['travelers.0.tax'],
    });
    expect(results.every(result => result.pass)).toBe(true);
    expect(tax).toHaveBeenCalled();
    expect(region).toHaveBeenCalled();
  });

  it('vendor rules with standard validation map values without rerunning', () => {
    const seen: unknown[] = [];
    const vendor = {
      '~standard': {
        vendor: 'n4s',
        validate: (value: unknown) => {
          seen.push(value);
          return { value: { mapped: true } };
        },
      },
      parse: () => ({ mapped: true }),
    };
    const results = runSchemaPaths(vendor, { a: 1 }, { affected: ['a'] });
    expect(seen).toHaveLength(1);
    expect(results.every(result => result.pass)).toBe(true);
    expect(results[0]).toMatchObject({ pass: true });
  });

  it('vendor validation issues fall back to run output', () => {
    const ran: unknown[] = [];
    const vendor = {
      '~standard': {
        vendor: 'n4s',
        validate: () => ({ issues: [{ message: 'nope' }] }),
      },
      parse: () => {
        throw new Error('unreachable');
      },
      run: (value: unknown) => {
        ran.push(value);
        return { pass: true, type: value };
      },
    };
    const results = runSchemaPaths(vendor, { a: 1 }, { affected: ['a'] });
    expect(ran).toHaveLength(1);
    expect(results.every(result => result.pass)).toBe(true);
  });

  it('empty and non-string changed entries resolve to no paths', () => {
    const schema = enforce.shape({ a: enforce.isString() });
    expect(resolveAffectedPaths(schema, [], { a: 'x' })).toEqual([]);
    expect(
      resolveAffectedPaths(schema, [null, 42] as never, { a: 'x' }),
    ).toEqual([]);
  });

  it('ignores own unsafe keys in run data without throwing', () => {
    const schema = enforce.shape({
      p: enforce.shape({ x: enforce.isString() }),
    });
    const data = JSON.parse('{"p":{"x":"ok","__proto__":1}}');
    expect(resolveAffectedPaths(schema, ['p'], data)).toContain('p.x');
  });

  it('terminates cyclic run data through the ancestor guard', () => {
    const schema = enforce.shape({
      loop: enforce.shape({ v: enforce.isString() }),
    });
    const data: Record<string, unknown> = { loop: { v: 'ok' } };
    (data.loop as Record<string, unknown>).self = data.loop;
    const resolved = resolveAffectedPaths(schema, ['loop'], data);
    expect(resolved).toContain('loop.v');
  });

  it('expands array roots by index through item members', () => {
    const schema = enforce.isArrayOf(
      enforce.shape({
        country: enforce.isString(),
        passport: enforce.isString().dependsOn($ => $.country),
      }),
    );
    const data = [{ country: 'A', passport: 'x' }];
    // Known limitation (open EX07): bare array roots resolve the changed
    // index but do not fan out to same-item dependents. This pins the
    // current traversal behavior for branch coverage; it must change
    // when array relationship scope lands.
    expect(resolveAffectedPaths(schema, ['0.country'], data)).toEqual([
      '0.country',
    ]);
  });

  it('supplements uncovered array indices exactly once after a main failure', () => {
    const calls: string[] = [];
    const item = (tag: string) =>
      enforce.shape({
        v: enforce.condition((value: unknown) => {
          calls.push(`${tag}:${String(value)}`);
          return value !== 'bad';
        }),
      });
    const schema = enforce.shape({ rows: enforce.isArrayOf(item('i')) });
    const failures = runSchemaPaths(
      schema,
      { rows: [{ v: 'bad' }, { v: 'bad' }, { v: 'ok' }] },
      { affected: ['rows.0.v', 'rows.1.v'] },
    ).filter(result => !result.pass);
    expect(failures.map(result => result.path)).toEqual([
      ['rows', '0', 'v'],
      ['rows', '1', 'v'],
    ]);
    // Unaffected valid members never execute; each failing member runs once.
    expect(calls).toEqual(['i:bad', 'i:bad']);
  });

  it('supplements tuple members positionally without rerunning winners', () => {
    const first = vi.fn(() => true);
    const second = vi.fn(() => false);
    const schema = enforce.shape({
      pair: enforce.tuple(enforce.condition(first), enforce.condition(second)),
    });
    const failures = runSchemaPaths(
      schema,
      { pair: ['ok', 'bad'] },
      { affected: ['pair.0', 'pair.1'] },
    ).filter(result => !result.pass);
    expect(failures).toHaveLength(1);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('reproduces container-kind contradictions instead of member failures', () => {
    const member = vi.fn(() => true);
    const schema = enforce.shape({
      rows: enforce.isArrayOf(enforce.condition(member)),
    });
    const failures = runSchemaPaths(
      schema,
      { rows: { not: 'an array' } },
      { affected: ['rows.0'] },
    ).filter(result => !result.pass);
    expect(member).not.toHaveBeenCalled();
    expect(
      failures.some(result => (result.path ?? []).join('.') === 'rows'),
    ).toBe(true);
  });

  it('supplements record entries by key without rerunning main verdicts', () => {
    const calls: string[] = [];
    const schema = enforce.shape({
      dict: enforce.record(
        enforce.condition((value: unknown) => {
          calls.push(String(value));
          return value !== 'bad';
        }),
      ),
    });
    const failures = runSchemaPaths(
      schema,
      { dict: { a: 'bad', b: 'ok' } },
      { affected: ['dict.a', 'dict.b'] },
    ).filter(result => !result.pass);
    expect(failures.map(result => result.path)).toEqual([['dict', 'a']]);
    expect(calls.filter(call => call === 'bad')).toHaveLength(1);
    expect(calls.filter(call => call === 'ok')).toHaveLength(1);
  });

  it('never supplements union members that need validation to choose', () => {
    const numeric = vi.fn(() => true);
    const boolean = vi.fn(() => true);
    const schema = enforce.shape({
      rows: enforce.isArrayOf(
        enforce.condition(numeric),
        enforce.condition(boolean),
      ),
      note: enforce.condition(() => false),
    });
    const failures = runSchemaPaths(
      schema,
      { rows: [1, true], note: 'bad' },
      { affected: ['rows.0', 'note'] },
    ).filter(result => !result.pass);
    expect(
      failures.some(result => (result.path ?? []).join('.') === 'note'),
    ).toBe(true);
    // Choosing a union branch would require validation: members stay
    // untouched rather than speculatively probed.
    expect(numeric).not.toHaveBeenCalled();
    expect(boolean).not.toHaveBeenCalled();
  });

  it('tolerates unparseable affected paths gracefully', () => {
    const schema = enforce.shape({ a: enforce.isString() });
    const results = runSchemaPaths(schema, { a: 'x' }, { affected: ['[[['] });
    expect(Array.isArray(results)).toBe(true);
  });

  it('resolves empty changed sets to no paths', () => {
    const schema = enforce.shape({
      a: enforce.isString().dependsOn($ => $.b),
      b: enforce.isString(),
    });
    expect(resolveAffectedPaths(schema, [])).toEqual([]);
  });

  it('expands descendants through composed facades', () => {
    const schema = compose(
      enforce.shape({
        p: enforce.shape({
          x: enforce.isString(),
          y: enforce.isString().dependsOn($ => $.x),
        }),
      }),
    );
    expect(
      resolveAffectedPaths(schema, ['p.x'], { p: { x: 1, y: 2 } }),
    ).toEqual(['p.x', 'p.y']);
  });

  it('supplements members hidden by divergence short-circuit exactly once', () => {
    const calls: string[] = [];
    const member = (field: string, valid: (value: unknown) => boolean) =>
      enforce.condition((value: unknown) => {
        calls.push(`${field}:${String(value)}`);
        return valid(value);
      });
    const schema = enforce.shape({
      a: member('a', value => value !== 'bad'),
      profile: enforce.shape({
        state: member('state', value => value !== 'bad'),
      }),
    });
    const failures = runSchemaPaths(
      schema,
      {
        a: 'ok',
        profile: { state: 'bad' },
        extra: undefined as unknown as string,
      },
      { affected: ['profile.state', 'extra'] },
    ).filter(result => !result.pass);
    expect(failures.map(result => result.path)).toEqual([['profile', 'state']]);
    expect(calls.filter(call => call.startsWith('state:'))).toHaveLength(1);
  });

  it('skip-all by name runs nothing and passes', () => {
    const a = vi.fn(() => true);
    const b = vi.fn(() => true);
    const results = runSchemaPaths(
      enforce.shape({
        a: enforce.condition(a),
        b: enforce.condition(b),
      }),
      { a: 'x', b: 'y' },
      { affected: ['a', 'b'], skip: ['a', 'b'] },
    );
    expect(a).not.toHaveBeenCalled();
    expect(b).not.toHaveBeenCalled();
    expect(results.every(result => result.pass)).toBe(true);
  });

  it('ignores nested skips under non-rule members', () => {
    const selected = vi.fn(() => true);
    const schema = enforce.shape({
      a: 'not-a-rule' as never,
      b: enforce.condition(selected),
    });
    const results = runSchemaPaths(
      schema,
      { a: 1, b: 'ok' },
      { affected: ['b'], skip: ['a.deeper'] },
    );
    expect(selected).toHaveBeenCalledTimes(1);
    expect(results.every(result => result.pass)).toBe(true);
  });

  it('never reruns a member the main run already failed', () => {
    const predicate = vi.fn().mockReturnValueOnce(false).mockReturnValue(true);
    const failures = runSchemaPaths(
      enforce.shape({ a: enforce.condition(predicate) }),
      { a: 1 },
      { affected: ['a'] },
    ).filter(result => !result.pass);
    expect(failures.map(result => result.path)).toEqual([['a']]);
    expect(predicate).toHaveBeenCalledTimes(1);
  });

  it('skips supplement when the main run covered a clean container', () => {
    const calls: string[] = [];
    const member = (field: string) =>
      enforce.condition(() => {
        calls.push(field);
        return true;
      });
    const schema = enforce.shape({
      profile: enforce.shape({ state: member('state'), city: member('city') }),
    });
    const results = runSchemaPaths(
      schema,
      { profile: { state: 'x', city: 'y' } },
      { affected: ['profile'] },
    );
    expect(results.every(result => result.pass)).toBe(true);
    expect(calls.filter(call => call === 'state')).toHaveLength(1);
    expect(calls.filter(call => call === 'city')).toHaveLength(1);
  });

  it('supplements record entries missing from the run data', () => {
    const member = vi.fn(() => true);
    const schema = enforce.shape({
      dict: enforce.record(enforce.condition(member)),
    });
    const results = runSchemaPaths(
      schema,
      { dict: {} },
      { affected: ['dict.a'] },
    );
    expect(results.every(result => result.pass)).toBe(true);
    expect(member).not.toHaveBeenCalled();
  });

  it('supplements array roots without object traversal', () => {
    const member = vi.fn(() => true);
    const schema = enforce.isArrayOf(enforce.condition(member));
    const results = runSchemaPaths(schema, ['a', 'b'], { affected: ['0'] });
    expect(results.every(result => result.pass)).toBe(true);
  });

  it('picks only-focused top-level members without affected', () => {
    const a = vi.fn(() => false);
    const b = vi.fn(() => false);
    const failures = runSchemaPaths(
      enforce.shape({
        a: enforce.condition(a),
        b: enforce.condition(b),
      }),
      { a: 1, b: 2 },
      { only: ['a'] },
    ).filter(result => !result.pass);
    expect(failures.map(result => result.path)).toEqual([['a']]);
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).not.toHaveBeenCalled();
  });

  it('intersects only with skip without running excluded members', () => {
    const a = vi.fn(() => false);
    const b = vi.fn(() => false);
    const c = vi.fn(() => false);
    const failures = runSchemaPaths(
      enforce.shape({
        a: enforce.condition(a),
        b: enforce.condition(b),
        c: enforce.condition(c),
      }),
      { a: 1, b: 2, c: 3 },
      { only: ['a', 'b'], skip: ['b'] },
    ).filter(result => !result.pass);
    expect(failures.map(result => result.path)).toEqual([['a']]);
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).not.toHaveBeenCalled();
    expect(c).not.toHaveBeenCalled();
  });

  it('omits skip-only top-level members without affected', () => {
    const a = vi.fn(() => false);
    const b = vi.fn(() => false);
    const failures = runSchemaPaths(
      enforce.shape({
        a: enforce.condition(a),
        b: enforce.condition(b),
      }),
      { a: 1, b: 2 },
      { skip: ['a'] },
    ).filter(result => !result.pass);
    expect(failures.map(result => result.path)).toEqual([['b']]);
    expect(a).not.toHaveBeenCalled();
    expect(b).toHaveBeenCalledTimes(1);
  });

  it('drops an affected parent covered by a nested skip without running', () => {
    const x = vi.fn(() => true);
    const schema = enforce.shape({
      a: enforce.shape({ x: enforce.condition(x) }),
    });
    const results = runSchemaPaths(
      schema,
      { a: { x: 'ok' } },
      { affected: ['a'], skip: ['a.x'] },
    );
    expect(results.every(result => result.pass)).toBe(true);
    expect(x).not.toHaveBeenCalled();
  });

  it('tolerates empty affected segments without throwing', () => {
    const selected = vi.fn(() => true);
    const results = runSchemaPaths(
      enforce.shape({ a: enforce.condition(selected) }),
      { a: 'x' },
      { affected: [''], skip: ['a'] },
    );
    expect(Array.isArray(results)).toBe(true);
    expect(results.every(result => result.pass)).toBe(true);
  });

  it('does not cascade a skip strictly above the affected path', () => {
    const b = vi.fn(() => false);
    const failures = runSchemaPaths(
      enforce.shape({ a: enforce.shape({ b: enforce.condition(b) }) }),
      { a: { b: 1 } },
      { affected: ['a.b'], skip: ['a'] },
    ).filter(result => !result.pass);
    expect(failures.map(result => result.path)).toEqual([['a', 'b']]);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it('reports unknown explicit-undefined keys first on partial tops', () => {
    const aFail = vi.fn(() => false);
    const bSpy = vi.fn(() => true);
    const failures = runSchemaPaths(
      enforce.partial({
        a: enforce.condition(aFail),
        b: enforce.condition(bSpy),
      }),
      { a: 1, extra: undefined } as Record<string, unknown>,
      { affected: ['b', 'extra'] },
    ).filter(result => !result.pass);
    // Partial evaluates the unknown explicit-undefined key before declared
    // members, so the main run short-circuits at `extra` and the absent
    // shadowed member never executes standalone.
    expect(failures.map(result => result.path)).toEqual([['extra']]);
    expect(bSpy).not.toHaveBeenCalled();
  });

  it('runs absent required members standalone in the flat supplement', () => {
    const aFail = vi.fn(() => false);
    const bSpy = vi.fn(() => false);
    const failures = runSchemaPaths(
      enforce.shape({
        a: enforce.condition(aFail),
        b: enforce.condition(bSpy),
      }),
      { a: 1, extra: undefined } as Record<string, unknown>,
      { affected: ['b', 'extra'] },
    ).filter(result => !result.pass);
    expect(failures.map(result => result.path)).toEqual([['b']]);
    expect(bSpy).toHaveBeenCalledTimes(1);
    expect(bSpy).toHaveBeenCalledWith(undefined);
  });

  it('skips flat supplement members orphaned from their root edge', () => {
    const aFail = vi.fn(() => false);
    const schema = enforce.shape({
      a: enforce.condition(aFail),
      b: enforce.isString().dependsOn($ => $.root.a),
    });
    const results = runSchemaPaths(
      schema,
      { a: 42, b: 'x', extra: undefined } as Record<string, unknown>,
      { affected: ['b', 'extra'] },
    );
    expect(Array.isArray(results)).toBe(true);
    expect(results.every(result => result.pass)).toBe(true);
    expect(aFail).toHaveBeenCalled();
  });

  it('reproduces tuple container failures when the value is too long', () => {
    const first = vi.fn(() => true);
    const second = vi.fn(() => true);
    const failures = runSchemaPaths(
      enforce.shape({
        pair: enforce.tuple(
          enforce.condition(first),
          enforce.condition(second),
        ),
      }),
      { pair: ['a', 'b', 'c'] },
      { affected: ['pair.0'] },
    ).filter(result => !result.pass);
    // Positions are meaningless without a valid length: the container's own
    // verdict reports at `pair` instead of inventing member attribution.
    expect(failures.map(result => result.path)).toEqual([['pair']]);
    expect(failures).toHaveLength(1);
  });

  it('reproduces tuple container failures when a required position is missing', () => {
    const schema = enforce.shape({
      pair: enforce.tuple(enforce.isString(), enforce.isNumber()),
    });
    const failures = runSchemaPaths(
      schema,
      { pair: ['ok'] },
      { affected: ['pair.0'] },
    ).filter(result => !result.pass);
    expect(failures.map(result => result.path)).toEqual([['pair']]);
  });

  it('accepts a missing trailing optional tuple position', () => {
    const first = vi.fn(() => true);
    const schema = enforce.shape({
      pair: enforce.tuple(
        enforce.condition(first),
        enforce.optional(enforce.isNumber()),
      ),
    });
    const results = runSchemaPaths(
      schema,
      { pair: ['ok'] },
      { affected: ['pair.0'] },
    );
    expect(results.every(result => result.pass)).toBe(true);
    expect(first).toHaveBeenCalledTimes(1);
  });

  it('reproduces tuple container failures for non-array values', () => {
    const member = vi.fn(() => true);
    const failures = runSchemaPaths(
      enforce.shape({
        pair: enforce.tuple(enforce.condition(member)),
      }),
      { pair: 'nope' },
      { affected: ['pair.0'] },
    ).filter(result => !result.pass);
    expect(failures.map(result => result.path)).toEqual([['pair']]);
    expect(member).not.toHaveBeenCalled();
  });

  it('reproduces union container failures for non-array values', () => {
    const numeric = vi.fn(() => true);
    const boolean = vi.fn(() => true);
    const failures = runSchemaPaths(
      enforce.shape({
        list: enforce.isArrayOf(
          enforce.condition(numeric),
          enforce.condition(boolean),
        ),
      }),
      { list: 'nope' },
      { affected: ['list.0'] },
    ).filter(result => !result.pass);
    expect(failures.map(result => result.path)).toEqual([['list']]);
    expect(numeric).not.toHaveBeenCalled();
    expect(boolean).not.toHaveBeenCalled();
  });

  it('ignores union indices beyond the runtime array', () => {
    const schema = enforce.shape({
      list: enforce.isArrayOf(enforce.isString(), enforce.isNumber()),
    });
    const results = runSchemaPaths(
      schema,
      { list: ['ok'] },
      { affected: ['list.5'] },
    );
    expect(results.every(result => result.pass)).toBe(true);
  });

  it('does not rerun union members the main run already covered', () => {
    const schema = enforce.shape({
      list: enforce.isArrayOf(
        enforce.condition(() => false),
        enforce.condition(() => false),
      ),
    });
    const failures = runSchemaPaths(
      schema,
      { list: [true] },
      { affected: ['list.0'] },
    ).filter(result => !result.pass);
    expect(failures.map(result => result.path)).toEqual([['list', '0']]);
    expect(failures).toHaveLength(1);
  });

  it('accepts union members through whole-member matching in the supplement', () => {
    const schema = enforce.shape({
      other: enforce.condition(() => false),
      list: enforce.isArrayOf(enforce.isString(), enforce.isNumber()),
    });
    const results = runSchemaPaths(
      schema,
      { other: 1, list: ['ok'] },
      { affected: ['list.0'] },
    );
    expect(results.every(result => result.pass)).toBe(true);
  });

  it('falls back to the top-level key for nullish array fan-out data', () => {
    const schema = enforce.shape({
      region: enforce.isString(),
      travelers: enforce.isArrayOf(
        enforce.shape({
          country: enforce.isString(),
          tax: enforce.isString().dependsOn($ => $.root.region),
        }),
      ),
    });
    const resolved = resolveAffectedPaths(schema, ['region'], undefined);
    expect(resolved).toContain('region');
    expect(resolved).toContain('travelers');
    expect(resolved.every(entry => !entry.includes('$item'))).toBe(true);
  });

  it('expands array descendants by index from run data', () => {
    const schema = enforce.shape({
      travelers: enforce.isArrayOf(
        enforce.shape({ country: enforce.isString() }),
      ),
    });
    const resolved = resolveAffectedPaths(schema, ['travelers'], {
      travelers: [{ country: 'A' }, { country: 'B' }],
    });
    expect(resolved).toContain('travelers.0');
    expect(resolved).toContain('travelers.1');
    expect(resolved).toContain('travelers.0.country');
  });

  it('expands record descendants through data keys', () => {
    const schema = enforce.shape({
      dict: enforce.record(enforce.isNumber()),
    });
    const resolved = resolveAffectedPaths(schema, ['dict'], {
      dict: { a: 1 },
    });
    expect(resolved).toContain('dict.a');
  });

  it('keeps unknown deep paths without diverging to the full fallback', () => {
    const schema = enforce.shape({ a: enforce.isString() });
    const results = runSchemaPaths(
      schema,
      { a: 'ok', extra: undefined } as Record<string, unknown>,
      { affected: ['unknown.deep'] },
    );
    expect(results.every(result => result.pass)).toBe(true);
  });

  it('tolerates tuple descendant indices beyond the declared members', () => {
    const schema = enforce.shape({
      pair: enforce.tuple(enforce.isString(), enforce.isNumber()),
    });
    const results = runSchemaPaths(
      schema,
      { pair: ['a', 1] },
      { affected: ['pair.5'] },
    );
    expect(results.every(result => result.pass)).toBe(true);
  });

  it('marks root reevaluated on a passing full fallback with coverage', () => {
    const schema = compose(
      enforce.shape({ a: enforce.isString() }),
      enforce.condition(() => true),
    );
    const coverage = { rootReevaluated: false };
    const results = runSchemaPaths(
      schema,
      { a: 'ok' },
      { affected: ['a'], coverage },
    );
    expect(results.every(result => result.pass)).toBe(true);
    expect(coverage.rootReevaluated).toBe(true);
  });

  it('leaves root unevaluated on a failing full fallback with coverage', () => {
    const schema = compose(
      enforce.shape({ a: enforce.isString() }),
      enforce.condition(() => true),
    );
    const coverage = { rootReevaluated: false };
    const failures = runSchemaPaths(
      schema,
      { a: 42 },
      { affected: ['a'], coverage },
    ).filter(result => !result.pass);
    expect(failures.map(result => result.path)).toEqual([['a']]);
    expect(coverage.rootReevaluated).toBe(false);
  });

  it('dispatches numeric record keys through the value rule', () => {
    const schema = enforce.shape({
      dict: enforce.record(enforce.isNumber()),
    });
    const failures = runSchemaPaths(
      schema,
      { dict: { '1': 'x' } },
      { affected: ['dict.1'] },
    ).filter(result => !result.pass);
    expect(failures.map(result => result.path)).toEqual([['dict', '1']]);
  });

  it('evaluates exact record keys against the two-arg key rule', () => {
    const schema = enforce.shape({
      dict: enforce.record(
        enforce.isString().matches(/^k/),
        enforce.isNumber(),
      ),
    });
    const failures = runSchemaPaths(
      schema,
      { dict: { zz: 1, bad: 2 } },
      { affected: ['dict.bad'] },
    ).filter(result => !result.pass);
    expect(failures.map(result => (result.path ?? []).join('.'))).toEqual([
      'dict.bad',
    ]);
  });

  it('skips absent partial members shadowed in the projected supplement', () => {
    const bSpy = vi.fn(() => true);
    const failures = runSchemaPaths(
      enforce.partial({
        a: enforce.condition(() => false),
        b: enforce.condition(bSpy),
      }),
      { a: 1 },
      { affected: ['a', 'b'] },
    ).filter(result => !result.pass);
    // The main run fails at `a`, proving `b` never executed; `b` is absent
    // from a partial-like parent, so the supplement skips it instead of
    // inventing a failure the full run never reports.
    expect(failures.map(result => result.path)).toEqual([['a']]);
    expect(bSpy).not.toHaveBeenCalled();
  });

  it('ignores single-array indices beyond the runtime array', () => {
    const schema = enforce.shape({
      items: enforce.isArrayOf(enforce.isString()),
    });
    const results = runSchemaPaths(
      schema,
      { items: ['ok'] },
      { affected: ['items.5'] },
    );
    expect(results.every(result => result.pass)).toBe(true);
  });

  it('runs nested arrays through the excluded-fragment member path', () => {
    const schema = enforce.shape({
      rows: enforce.isArrayOf(enforce.isArrayOf(enforce.isString())),
    });
    const failures = runSchemaPaths(
      schema,
      { rows: [['ok', 42]] },
      { affected: ['rows.0.1'] },
    ).filter(result => !result.pass);
    expect(failures.map(result => result.path)).toEqual([['rows', '0', '1']]);
  });

  it('supplements whole-kept arrays without rerunning visited indices', () => {
    const schema = enforce.shape({
      rows: enforce.isArrayOf(enforce.isString()),
    });
    const failures = runSchemaPaths(
      schema,
      { rows: [42, 43] },
      { affected: ['rows', 'rows.0', 'rows.1'] },
    ).filter(result => !result.pass);
    expect(failures.map(result => result.path)).toEqual([
      ['rows', '0'],
      ['rows', '1'],
    ]);
  });

  it('supplements whole-kept tuples without rerunning visited positions', () => {
    const schema = enforce.shape({
      pair: enforce.tuple(enforce.isString(), enforce.isNumber()),
    });
    const failures = runSchemaPaths(
      schema,
      { pair: [42, 'x'] },
      { affected: ['pair', 'pair.0', 'pair.1'] },
    ).filter(result => !result.pass);
    expect(failures.map(result => result.path)).toEqual([
      ['pair', '0'],
      ['pair', '1'],
    ]);
  });

  it('supplements whole-kept unions without rerunning visited elements', () => {
    const schema = enforce.shape({
      list: enforce.isArrayOf(enforce.isString(), enforce.isNumber()),
    });
    const failures = runSchemaPaths(
      schema,
      { list: [true, false] },
      { affected: ['list', 'list.0', 'list.1'] },
    ).filter(result => !result.pass);
    expect(failures.map(result => result.path)).toEqual([
      ['list', '0'],
      ['list', '1'],
    ]);
  });

  it('descends into excluded containers shadowed after a failure', () => {
    const schema = enforce.shape({
      a: enforce.condition(() => false),
      list: enforce.isArrayOf(enforce.isString()),
    });
    const failures = runSchemaPaths(
      schema,
      { a: 1, list: [42] },
      { affected: ['a', 'list.0'] },
    ).filter(result => !result.pass);
    expect(failures.map(result => result.path)).toEqual([['a'], ['list', '0']]);
  });

  it('reports deep record member failures when the entry is present', () => {
    const schema = enforce.shape({
      dict: enforce.record(enforce.shape({ x: enforce.isString() })),
    });
    const failures = runSchemaPaths(
      schema,
      { dict: { a: { x: 1 } } },
      { affected: ['dict.a.x'] },
    ).filter(result => !result.pass);
    expect(failures.map(result => result.path)).toEqual([['dict', 'a', 'x']]);
  });

  it('ignores deep record selections missing from the run data', () => {
    const member = vi.fn(() => true);
    const schema = enforce.shape({
      dict: enforce.record(enforce.shape({ x: enforce.condition(member) })),
    });
    const results = runSchemaPaths(
      schema,
      { dict: {} },
      { affected: ['dict.a.x'] },
    );
    expect(results.every(result => result.pass)).toBe(true);
    expect(member).not.toHaveBeenCalled();
  });
});
