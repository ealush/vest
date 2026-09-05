import { describe, expect, it } from 'vitest';

import {
  assertSchemaRootPathsValid,
  EnforceSchemaError,
  enforce,
  parseAffectedFieldName,
  resolveAffectedPaths,
  runSchemaPaths,
} from '../../n4s';
import type { SelectiveSchemaResult } from '../../n4s';
import type { RuleInstance } from '../../utils/RuleInstance';
import {
  buildProjectedSchema,
  filterSchemaResultsToAffected,
  mergeSupplementalResults,
} from '../selectiveRun';

/**
 * A runtime-foreign shape member: only `run` exists at runtime, so the
 * engine takes the vendor-gated exotic path (no construction markers, no
 * n4s vendor tag). The cast keeps this proven runtime object while
 * satisfying the builder's member constraint — it asserts the engine's
 * documented tolerance for absent member surface, nothing more.
 */
function foreignMember(
  run: (value: unknown) => unknown,
): RuleInstance<unknown, unknown[]> {
  return { run } as RuleInstance<unknown, unknown[]>;
}

describe('runSchemaPaths selective contract', () => {
  it('runs the full schema when no affected paths are given', () => {
    const schema = enforce.shape({
      a: enforce.isString(),
      b: enforce.isString(),
    });

    const [failure] = runSchemaPaths(schema, { a: 42, b: 'ok' });
    expect(failure?.pass).toBe(false);
    expect(failure?.path).toEqual(['a']);
  });

  it('narrows top-level failures to the affected paths', () => {
    const schema = enforce.shape({
      a: enforce.isString(),
      b: enforce.isString(),
    });

    const results = runSchemaPaths(
      schema,
      { a: 42, b: 43 },
      { affected: ['b'] },
    );
    const failures = results.filter(result => !result.pass);
    expect(failures).toHaveLength(1);
    expect(failures[0]?.path).toEqual(['b']);
  });

  it('projects nested fragments so unaffected validators never execute', () => {
    const seenOther: unknown[] = [];
    const schema = enforce.shape({
      profile: enforce.shape({
        state: enforce.isString(),
        country: enforce.isString(),
      }),
      other: enforce.condition((value: unknown): boolean => {
        seenOther.push(value);
        return typeof value === 'string';
      }),
    });

    const data = { profile: { state: 42, country: 'US' }, other: 'ok' };
    const results = runSchemaPaths(schema, data, {
      affected: ['profile.state'],
    });

    expect(
      results.some(
        result =>
          !result.pass && (result.path ?? []).join('.') === 'profile.state',
      ),
    ).toBe(true);
    expect(seenOther).toEqual([]);
  });

  it('throws EnforceSchemaError when the schema is absent', () => {
    const data = { a: 1 };
    expect(() => runSchemaPaths(undefined, data)).toThrowError(
      EnforceSchemaError,
    );
    expect(() => runSchemaPaths(null, data)).toThrowError(EnforceSchemaError);
  });
});

describe('assertSchemaRootPathsValid suite finalizer', () => {
  it('accepts a schema with resolvable rooted endpoints', () => {
    const schema = enforce.shape({
      accountType: enforce.isString(),
      company: enforce.shape({
        country: enforce.isString(),
        taxId: enforce
          .isString()
          .dependsOn($ => [$.country, $.root.accountType]),
      }),
    });

    expect(() => assertSchemaRootPathsValid(schema)).not.toThrow();
  });

  it('throws on a dangling rooted endpoint', () => {
    const schema = enforce.shape({
      company: enforce.shape({
        country: enforce.isString(),
        taxId: enforce.isString().dependsOn($ => [$.country, $.root.missing]),
      }),
    });

    expect(() => assertSchemaRootPathsValid(schema)).toThrowError(
      /unknown field "missing"/,
    );
  });

  it('quotes the full dotted path for a nested dangling endpoint', () => {
    const schema = enforce.shape({
      account: enforce.shape({ country: enforce.isString() }),
      company: enforce.shape({
        name: enforce.isString(),
        taxId: enforce
          .isString()
          .dependsOn($ => [$.name, $.root.account.missing]),
      }),
    });

    expect(() => assertSchemaRootPathsValid(schema)).toThrowError(
      /unknown field "account\.missing"/,
    );
  });

  it('quotes the full dotted path for a nested inline miss', () => {
    // Inner shapes resolve against their own scope, so the full quoted
    // path is scope-relative ("nested.path", not the leaf "path").
    expect(() =>
      enforce.shape({
        profile: enforce.shape({
          country: enforce.isString(),
          state: enforce.isString().dependsOn($ => $.nested.path),
        }),
      }),
    ).toThrowError(/unknown field "nested\.path"/);
  });

  it('ignores schemas without relationships', () => {
    expect(() => assertSchemaRootPathsValid(undefined)).not.toThrow();
    expect(() => assertSchemaRootPathsValid({})).not.toThrow();
  });

  it('propagates unexpected finalizer traversal failures', () => {
    const schema = {};
    Object.defineProperty(schema, '__schema', {
      get: () => {
        throw new TypeError('broken schema metadata');
      },
    });

    expect(() => assertSchemaRootPathsValid(schema)).toThrowError(
      new TypeError('broken schema metadata'),
    );
  });
});

describe('runSchemaPaths parse failures', () => {
  it('lets an unexpected TypeError from a foreign parse surface instead of falling back', () => {
    const buggy = {
      run: () => [{ pass: true, type: 'coerced' }],
      parse: () => {
        throw new TypeError(
          "Cannot read properties of undefined (reading 'x')",
        );
      },
    };
    expect(() => runSchemaPaths(buggy, { a: 1 })).toThrowError(
      /Cannot read properties/,
    );
    expect(() =>
      runSchemaPaths(buggy, { a: 1 }, { affected: ['a'] }),
    ).toThrowError(/Cannot read properties/);
  });

  it('lets an unexpected n4s validator TypeError surface loudly', () => {
    const schema = enforce.shape({ a: enforce.isString() });
    const data: Record<string, unknown> = { a: 'ok' };
    Object.defineProperty(data, 'a', {
      enumerable: true,
      get(): unknown {
        throw new TypeError('getter bug');
      },
    });
    expect(() => runSchemaPaths(schema, data)).toThrowError(/getter bug/);
    expect(() =>
      runSchemaPaths(schema, data, { affected: ['a'] }),
    ).toThrowError(/getter bug/);
  });
});

describe('runSchemaPaths foreign executable schemas', () => {
  it('matches full-run output for a truly foreign { run, parse } schema', () => {
    const exotic = {
      run: (value: unknown) =>
        (value as { a: unknown }).a === 'ok'
          ? [{ pass: true, type: value }]
          : [{ pass: false, path: ['a'], message: 'bad a' }],
      parse: (value: unknown) => {
        if ((value as { a: unknown }).a === 'ok') return value;
        const error = new Error('bad a') as Error & { isValidation: boolean };
        error.isValidation = true;
        throw error;
      },
    };
    const bad = { a: 'nope' };
    expect(runSchemaPaths(exotic, bad, { affected: ['a'] })).toEqual(
      runSchemaPaths(exotic, bad),
    );
    const good = { a: 'ok' };
    expect(runSchemaPaths(exotic, good, { affected: ['a'] })).toEqual(
      runSchemaPaths(exotic, good),
    );
  });
});

describe('runSchemaPaths unknown extra keys', () => {
  const strictUser = () =>
    enforce.shape({
      a: enforce.isString(),
      profile: enforce.shape({ state: enforce.isString() }),
    });

  it('matches the full-run verdict for an explicitly-undefined unknown key', () => {
    const schema = strictUser();
    const data = {
      a: 'ok',
      profile: { state: 'ok' },
      extra: undefined as unknown as string,
    };
    const full = runSchemaPaths(schema, data);
    expect(
      full.some(
        result => !result.pass && (result.path ?? []).join('.') === 'extra',
      ),
    ).toBe(true);
    expect(
      runSchemaPaths(schema, data, { affected: ['extra', 'profile.state'] }),
    ).toEqual(full);
  });

  it('matches the full-run verdict for a nested explicitly-undefined unknown key', () => {
    const schema = strictUser();
    const data = {
      a: 'ok',
      profile: { state: 'ok', extra: undefined as unknown as string },
    };
    const full = runSchemaPaths(schema, data);
    expect(
      full.some(
        result =>
          !result.pass && (result.path ?? []).join('.') === 'profile.extra',
      ),
    ).toBe(true);
    expect(
      runSchemaPaths(schema, data, { affected: ['profile.extra'] }),
    ).toEqual(full);
  });

  it('still fails present-with-value unknown keys selectively', () => {
    const schema = strictUser();
    const data = { a: 'ok', profile: { state: 'ok' }, extra: 'nope' };
    const selective = runSchemaPaths(schema, data, {
      affected: ['extra', 'profile.state'],
    });
    expect(
      selective.some(
        result => !result.pass && (result.path ?? []).join('.') === 'extra',
      ),
    ).toBe(true);
  });

  it('passes absent unknown keys on both runs', () => {
    const schema = strictUser();
    const data = { a: 'ok', profile: { state: 'ok' } };
    expect(
      runSchemaPaths(schema, data, { affected: ['extra', 'profile.state'] }),
    ).toEqual(runSchemaPaths(schema, data));
  });

  it('treats non-enumerable unknown keys as absent', () => {
    const schema = strictUser();
    const data: Record<string, unknown> = {
      a: 'ok',
      profile: { state: 'ok' },
    };
    Object.defineProperty(data, 'extra', {
      value: undefined,
      enumerable: false,
    });
    const full = runSchemaPaths(schema, data);
    expect(full.every(result => result.pass)).toBe(true);
    expect(
      runSchemaPaths(schema, data, { affected: ['extra', 'profile.state'] }),
    ).toEqual(full);
  });
});

describe('runSchemaPaths only/skip focus', () => {
  const twoStrings = () =>
    enforce.shape({ a: enforce.isString(), b: enforce.isString() });

  it('intersects only with affected instead of dropping it', () => {
    const failures = runSchemaPaths(
      twoStrings(),
      { a: 42, b: 43 },
      {
        affected: ['a', 'b'],
        only: 'a',
      },
    ).filter(result => !result.pass);
    expect(failures.map(result => result.path)).toEqual([['a']]);
  });

  it('treats a parent only as selecting the whole subtree', () => {
    const schema = enforce.shape({
      profile: enforce.shape({
        state: enforce.isString(),
        country: enforce.isString(),
      }),
      other: enforce.isString(),
    });
    const data = { profile: { state: 1, country: 2 }, other: 3 };
    const failures = runSchemaPaths(schema, data, {
      affected: ['profile.state', 'profile.country'],
      only: ['profile'],
    }).filter(result => !result.pass);
    expect(
      failures.map(result => (result.path ?? []).join('.')).sort(),
    ).toEqual(['profile.country', 'profile.state']);
  });

  it('runs nothing on a disjoint only', () => {
    const schema = enforce.shape({
      profile: enforce.shape({ state: enforce.isString() }),
      other: enforce.isString(),
    });
    const data = { profile: { state: 42 }, other: 'ok' };
    const results = runSchemaPaths(schema, data, {
      affected: ['profile.state'],
      only: ['other'],
    });
    expect(results.every(result => result.pass)).toBe(true);
    expect(results).toEqual([{ pass: true, type: data }]);
  });

  it('runs nothing for an explicit empty affected set', () => {
    const data = { a: 42, b: 43 };
    expect(runSchemaPaths(twoStrings(), data, { affected: [] })).toEqual([
      { pass: true, type: data },
    ]);
  });

  it('narrows synthesized failures by skip', () => {
    const failures = runSchemaPaths(
      twoStrings(),
      { a: 42, b: 43 },
      {
        affected: ['a', 'b'],
        skip: ['a'],
      },
    ).filter(result => !result.pass);
    expect(failures.map(result => result.path)).toEqual([['b']]);
  });

  it('passes everything through on skip-all', () => {
    const results = runSchemaPaths(
      twoStrings(),
      { a: 42, b: 43 },
      {
        affected: ['a', 'b'],
        skip: true,
      },
    );
    expect(results.every(result => result.pass)).toBe(true);
  });

  it('carries raw input — not a filtered failure type — on fabricated passes', () => {
    const coercing = foreignMember(() => ({
      pass: false,
      type: 42,
      message: 'too small',
    }));
    const schema = enforce.shape({
      doc: coercing,
      other: enforce.isString(),
    });
    const data = { doc: 'raw', other: 'ok' };
    expect(runSchemaPaths(schema, data).some(result => !result.pass)).toBe(
      true,
    );
    expect(runSchemaPaths(schema, data, { affected: ['missing'] })).toEqual([
      { pass: true, type: data },
    ]);
  });
});

describe('runSchemaPaths container supplementation', () => {
  it('surfaces affected array members hidden behind earlier failures', () => {
    const schema = enforce.shape({
      items: enforce.isArrayOf(enforce.isString()),
      other: enforce.isString(),
    });
    const failures = runSchemaPaths(
      schema,
      { items: [42, 'ok', 43], other: 'ok' },
      { affected: ['items.2'] },
    ).filter(result => !result.pass);
    expect(failures).toHaveLength(1);
    expect(failures[0]?.path).toEqual(['items', '2']);
  });

  it('runs affected tuple members positionally', () => {
    const schema = enforce.shape({
      pair: enforce.tuple(enforce.isString(), enforce.isNumber()),
    });
    const failures = runSchemaPaths(
      schema,
      { pair: [42, 'x'] },
      {
        affected: ['pair.1'],
      },
    ).filter(result => !result.pass);
    expect(failures).toHaveLength(1);
    expect(failures[0]?.path).toEqual(['pair', '1']);
  });

  it('resolves affected union members with whole-member matching', () => {
    const schema = enforce.shape({
      list: enforce.isArrayOf(enforce.isString(), enforce.isNumber()),
    });
    const failures = runSchemaPaths(
      schema,
      { list: ['ok', true] },
      {
        affected: ['list.1'],
      },
    ).filter(result => !result.pass);
    expect(failures).toHaveLength(1);
    expect(failures[0]?.path).toEqual(['list', '1']);
  });

  it('runs affected record keys shadowed by earlier entries', () => {
    const schema = enforce.shape({
      dict: enforce.record(enforce.isNumber()),
    });
    const failures = runSchemaPaths(
      schema,
      { dict: { first: 'x', second: 'y' } },
      {
        affected: ['dict.second'],
      },
    ).filter(result => !result.pass);
    expect(failures).toHaveLength(1);
    expect(failures[0]?.path).toEqual(['dict', 'second']);
  });

  it('evaluates affected record keys against the key rule', () => {
    const schema = enforce.shape({
      dict: enforce.record(
        enforce.isString().matches(/^k/),
        enforce.isNumber(),
      ),
    });
    const failures = runSchemaPaths(
      schema,
      { dict: { zz: 1, bad: 2 } },
      {
        affected: ['dict.bad'],
      },
    ).filter(result => !result.pass);
    expect(failures.map(result => (result.path ?? []).join('.'))).toEqual([
      'dict.bad',
    ]);
  });
});

describe('runSchemaPaths dependency expansion', () => {
  it('terminates and expands raw changes on cyclic dependencies', () => {
    const schema = enforce.shape({
      a: enforce.isString().dependsOn($ => $.b),
      b: enforce.isString().dependsOn($ => $.a),
    });
    // Raw 'a' fans out to its dependent 'b' inside the run: both invalid
    // members are reported, and the cyclic fixpoint still terminates.
    const bad = { a: 42, b: 43 };
    expect(
      runSchemaPaths(schema, bad, { affected: ['a'] })
        .filter(result => !result.pass)
        .map(result => result.path),
    ).toEqual([['a'], ['b']]);
    const good = { a: 'x', b: 'y' };
    expect(runSchemaPaths(schema, good, { affected: ['a'] })).toEqual(
      runSchemaPaths(schema, good),
    );
  });

  it('retains multi-segment root sources and attributes affected leaves', () => {
    const schema = enforce.shape({
      account: enforce.shape({ country: enforce.isString() }),
      company: enforce.shape({
        name: enforce.isString(),
        taxId: enforce.isString().dependsOn($ => $.root.account.country),
      }),
    });
    const badTax = {
      account: { country: 'US' },
      company: { name: 'x', taxId: 42 },
    };
    const taxFailures = runSchemaPaths(schema, badTax, {
      affected: ['company.taxId'],
    }).filter(result => !result.pass);
    expect(taxFailures.map(result => result.path)).toEqual([
      ['company', 'taxId'],
    ]);
    const badSource = {
      account: { country: 42 },
      company: { name: 'x', taxId: 'y' },
    };
    expect(
      runSchemaPaths(schema, badSource, {
        affected: ['company.taxId'],
      }).every(result => result.pass),
    ).toBe(true);
  });
});

describe('runSchemaPaths standalone boundaries', () => {
  const shapeWithMember = (thrown: unknown) =>
    enforce.shape({
      a: enforce.isString(),
      z: foreignMember(() => {
        throw thrown;
      }),
    });

  it('treats a same-copy EnforceSchemaError member as a boundary', () => {
    const schema = shapeWithMember(
      new EnforceSchemaError('EnforceSchemaError: orphaned source'),
    );
    const results = runSchemaPaths(
      schema,
      { a: 42, z: 'ok' },
      {
        affected: ['a', 'z'],
      },
    );
    expect(
      results.filter(result => !result.pass).map(result => result.path),
    ).toEqual([['a']]);
  });

  it('treats a cross-copy EnforceSchemaError (name fallback) as a boundary', () => {
    const crossCopy = Object.assign(new Error('orphaned source'), {
      name: 'EnforceSchemaError',
    });
    const schema = shapeWithMember(crossCopy);
    const results = runSchemaPaths(
      schema,
      { a: 42, z: 'ok' },
      {
        affected: ['a', 'z'],
      },
    );
    expect(
      results.filter(result => !result.pass).map(result => result.path),
    ).toEqual([['a']]);
  });

  it('lets a non-EnforceSchemaError member failure propagate', () => {
    const schema = shapeWithMember(new TypeError('member bug'));
    expect(() =>
      runSchemaPaths(schema, { a: 42, z: 'ok' }, { affected: ['a', 'z'] }),
    ).toThrowError(/member bug/);
  });
});

describe('parseAffectedFieldName canonical parser', () => {
  it('parses dotted and bracket spellings to one SchemaPath', () => {
    const expected = [
      { type: 'property', key: 'travelers' },
      { type: 'item', binding: '1' },
      { type: 'property', key: 'country' },
    ];
    expect(parseAffectedFieldName('travelers.1.country')).toEqual(expected);
    expect(parseAffectedFieldName('travelers[1].country')).toEqual(expected);
  });

  it('coerces numeric segments to item segments and back to numbers', () => {
    // Unified behavior: the canonical parser emits item segments for
    // numeric parts (suite-side vocabulary), and the selective engine
    // reads those same bindings back as numeric indices.
    const [travelers, index, country] = parseAffectedFieldName(
      'travelers[1].country',
    );
    expect(travelers).toEqual({ type: 'property', key: 'travelers' });
    expect(index?.type).toBe('item');
    expect(country).toEqual({ type: 'property', key: 'country' });
    const failures = runSchemaPaths(
      enforce.shape({
        travelers: enforce.isArrayOf(
          enforce.shape({ country: enforce.isString() }),
        ),
      }),
      { travelers: [{ country: 'US' }, { country: 42 }] },
      { affected: ['travelers[1].country'] },
    ).filter(result => !result.pass);
    expect(failures.map(result => result.path)).toEqual([
      ['travelers', '1', 'country'],
    ]);
  });
});

describe('runSchemaPaths single expansion', () => {
  const chain = () =>
    enforce.shape({
      a: enforce.isString(),
      b: enforce.isString().dependsOn($ => $.a),
      c: enforce.isString().dependsOn($ => $.b),
    });

  it('fans raw changed fields out to direct dependents without caller pre-expansion', () => {
    const failures = runSchemaPaths(
      chain(),
      { a: 42, b: 43, c: 44 },
      {
        affected: ['a'],
      },
    ).filter(result => !result.pass);
    expect(failures.map(result => result.path)).toEqual([['a'], ['b']]);
  });

  it('stays non-transitive: a second fan-out would pull c', () => {
    const failures = runSchemaPaths(
      chain(),
      { a: 42, b: 'ok', c: 44 },
      {
        affected: ['a'],
      },
    ).filter(result => !result.pass);
    expect(failures.map(result => result.path)).toEqual([['a']]);
    expect(failures.some(result => (result.path ?? []).join('.') === 'c')).toBe(
      false,
    );
  });

  it('accepts one pre-resolved plan without expanding it again', () => {
    const schema = chain();
    const resolved = resolveAffectedPaths(schema, ['a']);
    expect(resolved).toEqual(['a', 'b']);

    const failures = runSchemaPaths(
      schema,
      { a: 42, b: 43, c: 44 },
      { resolvedAffected: resolved },
    ).filter(result => !result.pass);

    expect(failures.map(result => result.path)).toEqual([['a'], ['b']]);
  });

  it('fans a raw array-parent change out from run data', () => {
    const schema = enforce.shape({
      region: enforce.isString(),
      travelers: enforce.isArrayOf(
        enforce.shape({
          country: enforce.isString(),
          tax: enforce.isString().dependsOn($ => $.root.region),
        }),
      ),
    });
    // Only the second member is invalid: without data fan-out the raw
    // 'region' change (itself valid) would report nothing.
    const data = {
      region: 'US',
      travelers: [
        { country: 'US', tax: 'ok' },
        { country: 'IL', tax: 42 },
      ],
    };
    const failures = runSchemaPaths(schema, data, {
      affected: ['region'],
    }).filter(result => !result.pass);
    expect(failures.map(result => result.path)).toEqual([
      ['travelers', '1', 'tax'],
    ]);
  });
});

describe('selectiveRun projection internals', () => {
  it('records keep the full rule under projection (key-rule parity)', () => {
    // Narrowing through record(value) would drop a two-arg record's key
    // rule (n4s exposes only the value rule in the item slot), so the
    // projection keeps the whole record rule. Suffixes alone cannot tell
    // numeric record keys from indices — the container-kind marker routes
    // here instead of the array rebuild, which would reject record data.
    const schema = enforce.shape({
      dictionary: enforce.record(
        enforce.isString().longerThan(3),
        enforce.shape({
          country: enforce.isString(),
          state: enforce.isString().dependsOn($ => $.country),
        }),
      ),
    });
    const projected = buildProjectedSchema(schema, ['dictionary.1.country']);
    expect(projected).not.toBeNull();
    if (projected === null) {
      throw new Error('projected schema must compose');
    }
    type DictData = Parameters<typeof schema.parse>[0];
    const parse = (projected as unknown as ExecutableFragment<DictData>).parse;
    expect(() =>
      parse({ dictionary: { abcd: { country: 'CA', state: 'abc' } } }),
    ).not.toThrow();
    // Key validation matches the full run exactly — nothing was dropped
    // (keys validate before values, so the short key throws either way).
    expect(() =>
      parse({ dictionary: { '1': { country: 'CA', state: 'abc' } } }),
    ).toThrow();
    expect(() =>
      schema.parse({ dictionary: { '1': { country: 'CA', state: 'abc' } } }),
    ).toThrow();
  });
});

describe('filterSchemaResultsToAffected post-filter', () => {
  // Nested skip names are unreachable through the typed focus API, so the
  // post-filter contract is pinned directly: exact skips drop, parent skips
  // do not (runtime parity), parent matching keeps in both directions, root
  // failures stay, numeric coercions ('1' vs 1) compare equal, and dotted
  // record keys keep the historical keep-behavior (dedupe collisions for
  // them are handled by structured result keys).
  const failure = (
    path: readonly string[],
    message = 'invalid',
  ): SelectiveSchemaResult => ({ pass: false, path, message });
  const data = {};
  const live = (results: SelectiveSchemaResult[]): boolean =>
    results.some(result => !result.pass);

  it('drops exact skips and keeps parent-skipped synthesis', () => {
    // Exact skip drops (an empty keep-set falls back to a pass entry).
    expect(
      live(
        filterSchemaResultsToAffected(
          [failure(['profile', 'state'])],
          ['profile'],
          data,
          ['profile.state'],
        ),
      ),
    ).toBe(false);

    // Parent skip does not suppress nested synthesis (runtime parity):
    // the failure is affected, and only an exact skip drops it.
    expect(
      live(
        filterSchemaResultsToAffected(
          [failure(['profile', 'state'])],
          ['profile.state'],
          data,
          ['profile'],
        ),
      ),
    ).toBe(true);
  });

  it('compares numeric coercions equal and keeps dotted record keys', () => {
    // Numeric coercions compare equal on both sides.
    expect(
      live(
        filterSchemaResultsToAffected(
          [failure(['dictionary', '1', 'state'])],
          ['dictionary.1.country', 'dictionary.1.state'],
          data,
          null,
        ),
      ),
    ).toBe(true);

    // Dotted record keys keep the historical keep-behavior.
    expect(
      live(
        filterSchemaResultsToAffected(
          [failure(['dictionary', 'a.b', 'state'])],
          ['dictionary.a'],
          data,
          null,
        ),
      ),
    ).toBe(true);
  });

  it('keeps pathless failures and honors dotted skip spellings', () => {
    // Pathless failures read as global: kept, never skipped.
    expect(
      live(filterSchemaResultsToAffected([failure([])], ['a'], data, ['a'])),
    ).toBe(true);

    // Bracket-spelled skips do not suppress dotted synthesis (runtime
    // parity): the runtime matches skip entries against test names exactly,
    // so skip('items[0]') leaves a synthesized 'items.0' failure in
    // place — exactly what the full run reports, where nested skips are
    // no-ops in omit().
    expect(
      live(
        filterSchemaResultsToAffected(
          [failure(['items', '0'])],
          ['items.0'],
          data,
          ['items[0]'],
        ),
      ),
    ).toBe(true);

    // The exact dotted spelling still drops.
    expect(
      live(
        filterSchemaResultsToAffected(
          [failure(['items', '0'])],
          ['items.0'],
          data,
          ['items.0'],
        ),
      ),
    ).toBe(false);
  });
});

describe('mergeSupplementalResults merger', () => {
  it('keeps same-message failures on colliding dotted paths', () => {
    // A literal dotted record key and a nested path join identically —
    // structured keys must not collapse them into one failure.
    const main: SelectiveSchemaResult[] = [
      { pass: false, path: ['dictionary', 'a', 'b', 'state'], message: 'x' },
    ];
    const extra: SelectiveSchemaResult[] = [
      { pass: false, path: ['dictionary', 'a.b', 'state'], message: 'x' },
    ];
    expect(mergeSupplementalResults(main, extra)).toHaveLength(2);
  });

  it('folds passing supplement types instead of appending them', () => {
    const main: SelectiveSchemaResult[] = [
      { pass: true, type: { rows: ['42'] } },
    ];
    const extra: SelectiveSchemaResult[] = [
      { pass: true, path: ['rows', '0'], type: 42 },
    ];
    const merged = mergeSupplementalResults(main, extra);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.type).toEqual({ rows: [42] });
  });
});

/**
 * Executable view of a projected fragment. The generic schema type cannot
 * name its own data type, so each test pins it from its own schema instead
 * of reaching for an untyped escape hatch.
 */
type ExecutableFragment<Data> = {
  parse: (value: Data) => unknown;
};
