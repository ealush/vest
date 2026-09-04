import { describe, expect, it } from 'vitest';
import { enforce } from 'n4s';

import { create, test } from '../../vest';

declare global {
  namespace n4s {
    interface EnforceMatchers {
      hasAllowedFlag: (value: { flag?: unknown }) => boolean;
      countCountry: (value: unknown) => boolean;
    }
  }
}

const rootSchema = enforce.shape({
  accountType: enforce.isString(),
  company: enforce.shape({
    country: enforce.isString(),
    taxId: enforce.isString().dependsOn($ => [$.country, $.root.accountType]),
  }),
});

describe('changed() source-retaining projection', () => {
  it('retains the local sibling source for a nested dependent', async () => {
    // The invalid dependent composes only with its sibling source
    // retained: the affected leaf failure is reported, not swallowed by an
    // orphaned-source fallback.
    const suite = create(() => {}, rootSchema);
    const data: {
      accountType: string;
      company: { country: string; taxId: string | number };
    } = {
      accountType: 'business',
      company: { country: 'CA', taxId: 42 },
    };
    // @ts-expect-error - probe: taxId is deliberately rule-invalid (number)
    const changed = await suite.changed('company.taxId').run(data);
    expect(changed.hasErrors('company.taxId')).toBe(true);
  });

  it('retains the $.root provider for a nested dependent', async () => {
    // Broken provider, valid dependent: the retained source composes, and
    // the provider failure attributes away from the affected leaf.
    const suite = create(() => {}, rootSchema);
    const data: {
      accountType: string | number;
      company: { country: string; taxId: string };
    } = {
      accountType: 42,
      company: { country: 'CA', taxId: 'ok' },
    };
    // @ts-expect-error - probe: accountType is deliberately rule-invalid
    const changed = await suite.changed('company.taxId').run(data);
    expect(changed.hasErrors('company.taxId')).toBe(false);
    expect(changed.hasErrors()).toBe(false);
  });

  it('projected fragments compose without orphaned sources', async () => {
    // Both the source-side and target-side changes run to a verdict:
    // neither direction orphans a dependency source at composition.
    const suite = create(() => {}, rootSchema);
    const badTax: {
      accountType: string;
      company: { country: string; taxId: string | number };
    } = {
      accountType: 'business',
      company: { country: 'CA', taxId: 42 },
    };
    // @ts-expect-error - probe: taxId is deliberately rule-invalid (number)
    const byTarget = await suite.changed('company.taxId').run(badTax);
    expect(byTarget.hasErrors('company.taxId')).toBe(true);
    const badCountry: {
      accountType: string;
      company: { country: string | number; taxId: string };
    } = {
      accountType: 'business',
      company: { country: 42, taxId: 'ok' },
    };
    // @ts-expect-error - probe: country is deliberately rule-invalid
    const bySource = await suite.changed('company.country').run(badCountry);
    expect(bySource.hasErrors('company.country')).toBe(true);
  });

  it('concretizes array item targets to the changed index', async () => {
    // Only index 0 is invalid while index 1 changed: same-index
    // concretization must not leak the unaffected index 0 failure in.
    const schema = enforce.shape({
      rows: enforce.isArrayOf(
        enforce.shape({
          country: enforce.isString(),
          state: enforce.isString().dependsOn($ => $.country),
        }),
      ),
    });
    const suite = create(() => {}, schema);
    const data: {
      rows: { country: string; state: string | number }[];
    } = {
      rows: [
        { country: 'US', state: 42 },
        { country: 'CA', state: 'ok' },
      ],
    };
    // @ts-expect-error - probe: rows.0.state is deliberately rule-invalid
    const changed = await suite.changed('rows.1.country').run(data);
    expect(changed.hasErrors('rows.1.state')).toBe(false);
    expect(changed.hasErrors('rows.0.state')).toBe(false);
    expect(changed.hasErrors()).toBe(false);
  });

  it('passes changed names through when the schema exposes no dependencies', async () => {
    // No graph, no expansion: the raw changed name still selects its test.
    const seen: string[] = [];
    const suite = create((data: { a: { b: string } }) => {
      test('a.b', () => {
        seen.push('a.b');
        enforce(data.a.b).isString();
      });
    });
    await suite.changed('a.b').run({ a: { b: 'x' } });
    expect(seen).toEqual(['a.b']);
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

  it('projects a partial container without first-failure masking', async () => {
    const schema = enforce.shape({
      profile: enforce.partial({
        unrelated: enforce.isString().longerThan(5),
        country: enforce.isString(),
        state: enforce
          .isString()
          .longerThan(5)
          .dependsOn($ => $.country),
      }),
    });
    const data = {
      profile: { unrelated: 'x', country: 'US', state: 'x' },
    };

    expect(schema.run(data).path).toEqual(['profile', 'unrelated']);
    const changed = await create((): void => {}, schema)
      .changed('profile.country')
      .run(data);

    expect(changed.hasErrors('profile.unrelated')).toBe(false);
    expect(changed.hasErrors('profile.state')).toBe(true);
  });

  it('projects a partial root without making omitted keys required', async () => {
    const schema = enforce.partial({
      unrelated: enforce.isString().longerThan(5),
      country: enforce.isString(),
      state: enforce
        .isString()
        .longerThan(5)
        .dependsOn($ => $.country),
    });
    const data = { unrelated: 'x', country: 'US', state: 'x' };

    expect(schema.run(data).path).toEqual(['unrelated']);
    const changed = await create((): void => {}, schema)
      .changed('country')
      .run(data);

    expect(changed.hasErrors('unrelated')).toBe(false);
    expect(changed.hasErrors('state')).toBe(true);
  });

  it('supplements shadowed members in a retained chained container', async () => {
    const schema = enforce.shape({
      profile: enforce
        .loose({
          unrelated: enforce.isString().longerThan(5),
          country: enforce.isString(),
          state: enforce
            .isString()
            .longerThan(5)
            .dependsOn($ => $.country),
        })
        .hasAllowedFlag(),
    });
    const data = {
      profile: {
        flag: true,
        unrelated: 'x',
        country: 'US',
        state: 'x',
      },
    };

    expect(schema.run(data).path).toEqual(['profile', 'unrelated']);
    const changed = await create((): void => {}, schema)
      .changed('profile.country')
      .run(data);

    expect(changed.hasErrors('profile.unrelated')).toBe(false);
    expect(changed.hasErrors('profile.state')).toBe(true);
  });

  it('supplements shadowed members when the root container is retained', async () => {
    const schema = enforce
      .loose({
        unrelated: enforce.isString().longerThan(5),
        country: enforce.isString(),
        state: enforce
          .isString()
          .longerThan(5)
          .dependsOn($ => $.country),
      })
      .hasAllowedFlag();
    const data = {
      flag: true,
      unrelated: 'x',
      country: 'US',
      state: 'x',
    };

    expect(schema.run(data).path).toEqual(['unrelated']);
    const changed = await create((): void => {}, schema)
      .changed('country')
      .run(data);

    expect(changed.hasErrors('unrelated')).toBe(false);
    expect(changed.hasErrors('state')).toBe(true);
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
