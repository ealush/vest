import { describe, expect, it } from 'vitest';
import { enforce } from 'n4s';
import { isNullish } from 'vest-utils';

import { create, test } from '../../vest';
import {
  buildProjectedSchema,
  expandAffectedWithSources,
  filterSchemaResultsToAffected,
  mergeSupplementalResults,
} from '../useCreateSuiteRunner';
import type { SchemaRunResult } from '../useCreateSuiteRunner';

declare global {
  namespace n4s {
    interface EnforceMatchers {
      hasAllowedFlag: (value: { flag?: unknown }) => boolean;
      countCountry: (value: unknown) => boolean;
    }
  }
}

/**
 * Executable view of a projected fragment. The generic schema type cannot
 * name its own data type, so each test pins it from its own schema instead
 * of reaching for an untyped escape hatch.
 */
type ExecutableFragment<Data> = {
  parse: (value: Data) => unknown;
};

const rootSchema = enforce.shape({
  accountType: enforce.isString(),
  company: enforce.shape({
    country: enforce.isString(),
    taxId: enforce.isString().dependsOn($ => [$.country, $.root.accountType]),
  }),
});

describe('changed() source-retaining projection', () => {
  it('retains the local sibling source for a nested dependent', () => {
    const expanded = expandAffectedWithSources(rootSchema, [
      'accountType',
      'company.taxId',
    ]);
    expect(expanded).toContain('accountType');
    expect(expanded).toContain('company.taxId');
    expect(expanded).toContain('company.country');
  });

  it('retains the $.root provider for a nested dependent', () => {
    const expanded = expandAffectedWithSources(rootSchema, [
      'company.country',
      'company.taxId',
    ]);
    expect(expanded).toContain('accountType');
  });

  it('projected fragment composes without orphaned sources', () => {
    for (const affected of [
      ['accountType', 'company.taxId'],
      ['company.country', 'company.taxId'],
    ]) {
      const expanded = expandAffectedWithSources(rootSchema, affected);
      const projected = buildProjectedSchema(rootSchema, expanded);
      expect(projected).not.toBeNull();
      if (isNullish(projected)) {
        throw new Error('projected schema must compose');
      }
      // Projected fragments stay executable: parse accepts the source
      // schema's own data. The fragment type cannot name that data type, so
      // this single interop-boundary assertion pins it precisely per schema.
      type RootData = Parameters<typeof rootSchema.parse>[0];
      const parse = (projected as unknown as ExecutableFragment<RootData>)
        .parse;
      expect(() =>
        parse({
          accountType: 'business',
          company: { country: 'CA', taxId: '123' },
        }),
      ).not.toThrow();
    }
  });

  it('concretizes array item sources to the affected index', () => {
    const schema = enforce.shape({
      rows: enforce.isArrayOf(
        enforce.shape({
          country: enforce.isString(),
          state: enforce.isString().dependsOn($ => $.country),
        }),
      ),
    });
    const expanded = expandAffectedWithSources(schema, [
      'rows.1.country',
      'rows.1.state',
    ]);
    expect(expanded).toContain('rows.1.country');
    const projected = buildProjectedSchema(schema, expanded);
    expect(projected).not.toBeNull();
  });

  it('passes through when the schema exposes no dependencies', () => {
    expect(expandAffectedWithSources({}, ['a.b'])).toEqual(['a.b']);
  });

  it('record string keys: changed(recordKey.field) invalidates dependents', async () => {
    // 'x' is a string (type-valid) but too short (rule-invalid), so the
    // fixture violates the rule without type escape hatches.
    const schema = enforce.shape({
      dictionary: enforce.record(
        enforce.shape({
          country: enforce.isString(),
          state: enforce
            .isString()
            .longerThan(5)
            .dependsOn($ => $.country),
        }),
      ),
    });
    const seen: string[] = [];
    const suite = create(data => {
      test('dictionary.home.country', () => {
        seen.push('dictionary.home.country');
        enforce(data.dictionary.home.country).isString();
      });
      test('dictionary.home.state', () => {
        seen.push('dictionary.home.state');
        enforce(data.dictionary.home.state).isString();
      });
    }, schema);

    const data = { dictionary: { home: { country: 'US', state: 'x' } } };
    const full = await suite.run(data);
    expect(full.hasErrors('dictionary.home.state')).toBe(true);

    seen.length = 0;
    const changed = await suite.changed('dictionary.home.country').run(data);
    // The string record key must match the relationship's item segment —
    // the dependent's failure cannot be swallowed.
    expect(changed.hasErrors('dictionary.home.state')).toBe(true);
    expect(seen).toContain('dictionary.home.state');
  });

  it('array per-index: a shadowed affected failure is still reported', async () => {
    // Both states are rule-invalid ('x' fails longerThan) but only index 1
    // is affected. The union projection reports just the first failing item
    // (rows.0.state), which the post-filter drops — the per-index supplement
    // must still surface the affected rows.1.state failure.
    const schema = enforce.shape({
      rows: enforce.isArrayOf(
        enforce.shape({
          country: enforce.isString(),
          state: enforce
            .isString()
            .longerThan(5)
            .dependsOn($ => $.country),
        }),
      ),
    });
    const seen: string[] = [];
    const suite = create(data => {
      test('rows.0.country', () => {
        seen.push('rows.0.country');
        enforce(data.rows[0].country).isString();
      });
      test('rows.1.country', () => {
        seen.push('rows.1.country');
        enforce(data.rows[1].country).isString();
      });
    }, schema);

    const data = {
      rows: [
        { country: 'US', state: 'x' },
        { country: 'CA', state: 'x' },
      ],
    };
    const changed = await suite.changed('rows.1.country').run(data);
    expect(changed.hasErrors('rows.1.state')).toBe(true);
    expect(changed.hasErrors('rows.0.state')).toBe(false);
    expect(seen).toContain('rows.1.country');
    expect(seen).not.toContain('rows.0.country');
  });

  it('record per-key: a shadowed affected key is still reported', async () => {
    // Both keys are rule-invalid, but only b is affected. The union
    // projection reports just the first failing key (a), which the
    // post-filter drops — the per-key supplement must surface b.state.
    const schema = enforce.shape({
      dictionary: enforce.record(
        enforce.shape({
          country: enforce.isString(),
          state: enforce
            .isString()
            .longerThan(5)
            .dependsOn($ => $.country),
        }),
      ),
    });
    const seen: string[] = [];
    const suite = create(data => {
      test('dictionary.b.country', () => {
        seen.push('dictionary.b.country');
        enforce(data.dictionary.b.country).isString();
      });
    }, schema);

    const data = {
      dictionary: {
        a: { country: 'US', state: 'x' },
        b: { country: 'CA', state: 'x' },
      },
    };
    const changed = await suite.changed('dictionary.b.country').run(data);
    expect(changed.hasErrors('dictionary.b.state')).toBe(true);
    expect(changed.hasErrors('dictionary.a.state')).toBe(false);
    expect(seen).toContain('dictionary.b.country');
  });

  it('nested shape array: shadowed failures surface below shapes', async () => {
    // Same shadowing as top-level arrays, but nested under a shape: the
    // supplement must descend through group to reach rows.
    const schema = enforce.shape({
      group: enforce.shape({
        rows: enforce.isArrayOf(
          enforce.shape({
            country: enforce.isString(),
            state: enforce
              .isString()
              .longerThan(5)
              .dependsOn($ => $.country),
          }),
        ),
      }),
    });
    const seen: string[] = [];
    const suite = create(data => {
      test('group.rows.1.country', () => {
        seen.push('group.rows.1.country');
        enforce(data.group.rows[1].country).isString();
      });
    }, schema);

    const data = {
      group: {
        rows: [
          { country: 'US', state: 'x' },
          { country: 'CA', state: 'x' },
        ],
      },
    };
    const changed = await suite.changed('group.rows.1.country').run(data);
    expect(changed.hasErrors('group.rows.1.state')).toBe(true);
    expect(changed.hasErrors('group.rows.0.state')).toBe(false);
    expect(seen).toContain('group.rows.1.country');
  });

  it('skip() narrows synthesized schema failures by exact name', async () => {
    // Suite tests use isString (pass on 'x'); only schema synthesis fails.
    const schema = enforce.shape({
      nick: enforce.isString().longerThan(5),
    });
    const suite = create(data => {
      test('nick', () => {
        enforce(data.nick).isString();
      });
    }, schema);

    const data = { nick: 'x' };
    const unskipped = await suite.changed('nick').run(data);
    expect(unskipped.hasErrors('nick')).toBe(true);

    // omit() honors the top-level skip and the post-filter agrees.
    const skipped = await suite
      .focus({ skip: 'nick' })
      .changed('nick')
      .run(data);
    expect(skipped.hasErrors('nick')).toBe(false);
  });

  it('boolean skip(true) with changed() drops all synthesized failures', async () => {
    // Boolean skip-all is a legal modifier (SuiteTypes) and must mirror the
    // runtime, which skips every test: asArray(true) is [true] and must
    // never reach field-name normalization (TypeError: field.replace).
    const schema = enforce.shape({
      profile: enforce.shape({
        state: enforce.isString().longerThan(5),
      }),
    });
    const suite = create(data => {
      test('profile.state', () => {
        enforce(data.profile.state).isString();
      });
    }, schema);

    const data = { profile: { state: 'x' } };
    const skipped = await suite
      .focus({ skip: true })
      .changed('profile.state')
      .run(data);
    expect(skipped.hasErrors('profile.state')).toBe(false);
  });

  it('failure filtering: exact skips, parent keeps, coercion equality', () => {
    // Nested skip names are unreachable through the typed focus API, so
    // the post-filter contract is pinned directly: exact skips drop,
    // parent skips do not (runtime parity), parent matching keeps in both
    // directions, root failures stay, numeric coercions ('1' vs 1) compare
    // equal, and dotted record keys keep the historical keep-behavior
    // (dedupe collisions for them are handled by structured result keys).
    const failure = (
      path: readonly string[],
      message = 'invalid',
    ): SchemaRunResult => ({ pass: false, path, message });
    const data = {};
    const live = (results: SchemaRunResult[]): boolean =>
      results.some(result => !result.pass);

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

    // Pathless failures read as global: kept, never skipped.
    expect(
      live(filterSchemaResultsToAffected([failure([])], ['a'], data, ['a'])),
    ).toBe(true);
  });

  it('skip() of a parent does not suppress nested synthesis', async () => {
    // Runtime skip() matches user tests by exact field name; synthesized
    // schema tests mirror that — skipping 'profile' leaves a nested
    // 'profile.state' failure in place, exactly as a user test there would.
    const schema = enforce.shape({
      profile: enforce.shape({
        country: enforce.isString(),
        state: enforce
          .isString()
          .longerThan(5)
          .dependsOn($ => $.country),
      }),
    });
    const suite = create(data => {
      test('profile.country', () => {
        enforce(data.profile.country).isString();
      });
    }, schema);

    const data = { profile: { country: 'US', state: 'x' } };
    const skipped = await suite
      .focus({ skip: 'profile' })
      .changed('profile.country')
      .run(data);
    expect(skipped.hasErrors('profile.state')).toBe(true);
  });

  it('record numeric keys: supplement dispatches stringified', async () => {
    // Affected paths coerce numeric segments to numbers, but record keys
    // stay strings at runtime — the supplement must match across that.
    const schema = enforce.shape({
      dictionary: enforce.record(
        enforce.shape({
          country: enforce.isString(),
          state: enforce
            .isString()
            .longerThan(5)
            .dependsOn($ => $.country),
        }),
      ),
    });
    const seen: string[] = [];
    const suite = create(data => {
      test('dictionary.1.country', () => {
        seen.push('dictionary.1.country');
        enforce(data.dictionary['1'].country).isString();
      });
    }, schema);

    const data = {
      dictionary: {
        '0': { country: 'US', state: 'x' },
        '1': { country: 'CA', state: 'x' },
      },
    };
    const changed = await suite.changed('dictionary.1.country').run(data);
    expect(changed.hasErrors('dictionary.1.state')).toBe(true);
    expect(changed.hasErrors('dictionary.0.state')).toBe(false);
    expect(seen).toContain('dictionary.1.country');
  });

  it('records keep the full rule under projection (key-rule parity)', () => {
    // Narrowing through record(value) would drop a two-arg record's key
    // rule (n4s exposes only the value rule in the item slot), so the
    // projection keeps the whole record rule. Suffixes alone cannot tell
    // numeric record keys from indices — the container-kind marker routes
    // here instead of the array rebuild, which would reject record data.
    // A single affected key matters: with every key affected the value
    // shape narrows to nothing and the old rebuild path is never reached.
    const schema = enforce.shape({
      dictionary: enforce.record(
        enforce.isString().longerThan(3),
        enforce.shape({
          country: enforce.isString(),
          state: enforce.isString().dependsOn($ => $.country),
        }),
      ),
    });
    const expanded = expandAffectedWithSources(schema, [
      'dictionary.1.country',
    ]);
    const projected = buildProjectedSchema(schema, expanded);
    expect(projected).not.toBeNull();
    if (isNullish(projected)) {
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

  it('supplement skips members when data contradicts the container kind', async () => {
    // Array schema with object data: per-key dispatch would invent a
    // member failure the full run never attributed. The container-kind
    // guard must skip the supplement (the container failure itself stays).
    const schema = enforce.shape({
      tags: enforce.isArrayOf(enforce.isString().longerThan(5)),
    });
    const suite = create(() => {
      test('tags', () => {
        enforce('x').isString();
      });
    }, schema);

    const data = { tags: { 0: 'xx' } };
    // @ts-expect-error — reason: intentionally mistyped container (object
    // instead of array) to prove the supplement skips the contradiction.
    const changed = await suite.changed('tags.0').run(data);
    expect(changed.hasErrors('tags.0')).toBe(false);
  });

  it('supplement surfaces shadowed failures in kind-contradicting members', async () => {
    // A nested member whose value contradicts the member kind: the full
    // run attributes the inner failure to the member path (isArrayOf
    // prefixes the member index), so the supplement must surface it even
    // when an earlier member's failure shadows it in the main run.
    // Guarding the member run itself by container kind would report this
    // affected member clean — that guard belongs only to dispatch.
    const schema = enforce.shape({
      matrix: enforce.isArrayOf(
        enforce.isArrayOf(
          enforce.shape({ v: enforce.isString().longerThan(5) }),
        ),
      ),
    });
    const suite = create(() => {}, schema);
    const data = { matrix: [[{ v: 'xx' }], 'oops'] };
    // @ts-expect-error — reason: intentionally mistyped member ('oops'
    // is not an array) to pin supplement attribution for contradicting
    // members.
    const changed = await suite.changed('matrix.1').run(data);
    expect(changed.hasErrors('matrix.1')).toBe(true);
  });

  it('merge keeps same-message failures on colliding dotted paths', () => {
    // A literal dotted record key and a nested path join identically —
    // structured keys must not collapse them into one failure.
    const main: SchemaRunResult[] = [
      { pass: false, path: ['dictionary', 'a', 'b', 'state'], message: 'x' },
    ];
    const extra: SchemaRunResult[] = [
      { pass: false, path: ['dictionary', 'a.b', 'state'], message: 'x' },
    ];
    expect(mergeSupplementalResults(main, extra)).toHaveLength(2);
  });

  it('primitive containers: per-member failures without graphs', async () => {
    // Arrays/records of primitives carry no dependency graph, but
    // per-member attribution must still work — first-failure shadowing
    // applies. Values stay type-valid ('xx' fails longerThan, not isString).
    const schema = enforce.shape({
      tags: enforce.isArrayOf(enforce.isString().longerThan(5)),
      dictionary: enforce.record(enforce.isString().longerThan(5)),
    });
    const seen: string[] = [];
    const suite = create(data => {
      test('tags.1', () => {
        seen.push('tags.1');
        enforce(data.tags[1]).isString();
      });
    }, schema);

    const data = { tags: ['xx', 'yy'], dictionary: { a: 'xx', b: 'yy' } };
    const changedTags = await suite.changed('tags.1').run(data);
    expect(changedTags.hasErrors('tags.1')).toBe(true);
    expect(changedTags.hasErrors('tags.0')).toBe(false);
    expect(seen).toContain('tags.1');

    const changedRecord = await suite.changed('dictionary.b').run(data);
    expect(changedRecord.hasErrors('dictionary.b')).toBe(true);
    expect(changedRecord.hasErrors('dictionary.a')).toBe(false);
  });

  it('deferred rooted validation timing is observable', () => {
    // Composition and describe() stay lenient for rooted paths so focused
    // fragments keep composing; enforcement lands at execution.
    const schema = enforce.shape({
      a: enforce.isString(),
      b: enforce.isString().dependsOn($ => $.root.missing),
    });
    const described = schema.describe();
    expect(described.dependencies).toHaveLength(1);
    expect(() => schema.test({ a: 'x', b: 'y' })).toThrow();
  });

  it('partial containers keep their semantics under projection', async () => {
    // Narrowing profile to {country, state} must not make the dropped key
    // or the missing state required: the container stays partial. A loose()
    // rebuild would report a spurious missing-state failure.
    const schema = enforce.shape({
      profile: enforce.partial({
        country: enforce.isString(),
        state: enforce.isString().dependsOn($ => $.country),
        nickname: enforce.isString(),
      }),
    });
    const seen: string[] = [];
    const suite = create(data => {
      test('profile.country', () => {
        seen.push('profile.country');
        enforce(data.profile.country).isString();
      });
    }, schema);

    const data = { profile: { country: 'US' } };
    const full = await suite.run(data);
    expect(full.hasErrors('profile.country')).toBe(false);
    expect(full.hasErrors('profile.state')).toBe(false);

    seen.length = 0;
    const changed = await suite.changed('profile.country').run(data);
    expect(seen).toContain('profile.country');
    expect(changed.hasErrors('profile.country')).toBe(false);
    expect(changed.hasErrors('profile.state')).toBe(false);
  });

  it('P1-1: changed() keeps container validators chained after the combinator', async () => {
    // A validator chained onto the container itself (not a member) must
    // survive projection: dropping it makes changed() pass a run that the
    // full suite fails. The baseline bail-out retains the whole subtree.
    enforce.extend({
      hasAllowedFlag: (value: { flag?: unknown }): boolean =>
        value.flag === true,
    });
    const schema = enforce
      .loose({
        profile: enforce.shape({ country: enforce.isString() }),
        flag: enforce.isBoolean(),
      })
      .hasAllowedFlag();
    const suite = create((): void => {}, schema);
    const bad: { profile: { country: string }; flag: boolean } = {
      profile: { country: 'US' },
      flag: false,
    };
    expect(suite.runStatic(bad).hasErrors()).toBe(true);
    const changed = await suite.changed('profile.country').run(bad);
    expect(changed.hasErrors()).toBe(true);
  });

  it('P1-2: changed() narrows an all-optional shape instead of retaining it', async () => {
    // Every member is optional, so the container accepts {} — but it is an
    // ordinary loose() shape, not partial(). Retaining the whole subtree
    // lets the unrelated earlier failure (nickname) shadow the affected
    // dependent failure (state) after post-filtering.
    const schema = enforce.loose({
      profile: enforce.shape({
        nickname: enforce.optional(enforce.isString().shorterThan(3)),
        state: enforce.optional(enforce.isString().dependsOn($ => $.country)),
        country: enforce.optional(enforce.isString()),
      }),
    });
    const suite = create((): void => {}, schema);
    const data: {
      profile: { nickname: string; state: string | number; country: string };
    } = {
      profile: { nickname: 'toolongname', state: 42, country: 'US' },
    };
    // @ts-expect-error - probe: state is deliberately rule-invalid (number) to pin the shadowed affected failure
    const changed = await suite.changed('profile.state').run(data);
    expect(changed.hasErrors('profile.state')).toBe(true);
    expect(changed.hasErrors('profile.nickname')).toBe(false);
  });

  it('P1-3a: changed() surfaces an affected tuple member hidden by first-failure', async () => {
    // Tuples report only the first failing position: member 0 fails, so the
    // full run never reaches member 1. The positional supplement must still
    // surface the affected member 1 failure with exact attribution.
    const schema = enforce.shape({
      point: enforce.tuple(
        enforce.isString().shorterThan(2),
        enforce.isNumber(),
      ),
    });
    const suite = create((): void => {}, schema);
    const data: { point: [string, number | string] } = {
      point: ['toolong', 'x'],
    };
    // @ts-expect-error - probe: members deliberately rule-invalid to pin order-dependent hiding
    const full = await suite.run(data);
    expect(full.hasErrors('point.0')).toBe(true);
    expect(full.hasErrors('point.1')).toBe(false);
    // @ts-expect-error - probe: members deliberately rule-invalid to pin order-dependent hiding
    const changed = await suite.changed('point.1').run(data);
    expect(changed.hasErrors('point.1')).toBe(true);
    expect(changed.hasErrors('point.0')).toBe(false);
  });

  it('P1-3b: changed() surfaces an affected union element hidden by first-failure', async () => {
    // Union elements must match some member: element 0 matches neither, so
    // the full run reports only element 0. The supplement resolves
    // whole-member matching per affected index and reproduces the generic
    // element failure for element 1.
    const memberA = enforce.shape({
      kind: enforce.isString(),
      a: enforce.isString(),
    });
    const memberB = enforce.shape({
      kind: enforce.isString(),
      b: enforce.isString(),
    });
    const schema = enforce.shape({
      rows: enforce.isArrayOf(memberA, memberB),
    });
    const suite = create((): void => {}, schema);
    const data: { rows: Array<{ kind: string }> } = {
      rows: [{ kind: 'x' }, { kind: 'y' }],
    };
    // @ts-expect-error - probe: elements deliberately match no member to pin order-dependent hiding
    const full = await suite.run(data);
    expect(full.hasErrors('rows.0')).toBe(true);
    expect(full.hasErrors('rows.1')).toBe(false);
    // @ts-expect-error - probe: elements deliberately match no member to pin order-dependent hiding
    const changed = await suite.changed('rows.1.kind').run(data);
    expect(changed.hasErrors('rows.1')).toBe(true);
    expect(changed.hasErrors('rows.0')).toBe(false);
  });

  it('P1-4: focused array validation runs affected members exactly once', async () => {
    // Selective execution: the unaffected rows.0 validator must not run,
    // and the affected rows.1 validator must run exactly once (main run or
    // supplement — never both). A counter matcher observes every call.
    const seen: unknown[] = [];
    enforce.extend({
      countCountry: (value: unknown): boolean => {
        seen.push(value);
        return typeof value === 'string';
      },
    });
    const schema = enforce.shape({
      rows: enforce.isArrayOf(
        enforce.shape({
          country: enforce.isString().countCountry(),
          state: enforce.isString(),
        }),
      ),
    });
    const suite = create((): void => {}, schema);
    const data = {
      rows: [
        { country: 'US', state: 'CA' },
        { country: 'CA', state: 'NY' },
      ],
    };
    const changed = await suite.changed('rows.1.country').run(data);
    expect(changed.hasErrors()).toBe(false);
    expect(seen).toEqual(['CA']);
  });
});
