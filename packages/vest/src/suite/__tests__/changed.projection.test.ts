import { describe, expect, it } from 'vitest';
import { enforce } from 'n4s';
import { isNullish } from 'vest-utils';

import { create, test } from '../../vest';
import {
  buildProjectedSchema,
  expandAffectedWithSources,
} from '../useCreateSuiteRunner';

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
    // fixture violates the rule without any type escape hatches.
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

  it('skip() narrows synthesized schema failures', async () => {
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
      test('profile.state', () => {
        enforce(data.profile.state).isString();
      });
    }, schema);

    const data = { profile: { country: 'US', state: 'x' } };
    const unskipped = await suite.changed('profile.country').run(data);
    expect(unskipped.hasErrors('profile.state')).toBe(true);

    // Skipping the subtree must suppress its synthesized failure — the
    // projected path must honor skip() like the focused path does.
    const skipped = await suite
      .focus({ skip: 'profile' })
      .changed('profile.country')
      .run(data);
    expect(skipped.hasErrors('profile.state')).toBe(false);
    expect(skipped.hasErrors('profile.country')).toBe(false);
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
});
