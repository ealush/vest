import { describe, expect, it, vi } from 'vitest';

import { SchemaExclusionError, compose } from 'n4s';

import { create, enforce, group, mode, Modes, test, warn } from '../../vest';

type SkippedBehavior = 'pass' | 'fail' | 'throw';

function skippedPredicate(behavior: SkippedBehavior) {
  if (behavior === 'pass') return vi.fn(() => true);
  if (behavior === 'fail') return vi.fn(() => false);
  return vi.fn(() => {
    throw new Error('excluded predicate executed');
  });
}

function runChangedSkip(
  schema: unknown,
  data: Record<string, unknown>,
  affected: string[],
  skip: string[],
): any {
  const suite = create(() => {}, schema as never) as any;
  return suite.changed(affected).focus({ skip }).run(data);
}

describe('schema contracts: exclusion overlap and fan-out (EX03)', () => {
  function subtreeFixture() {
    const pa = vi.fn(() => true);
    const pb = vi.fn(() => true);
    const other = vi.fn(() => true);
    const schema = enforce.shape({
      profile: enforce.shape({
        a: enforce.condition(pa),
        b: enforce.condition(pb),
      }),
      other: enforce.condition(other),
    });
    return { other, pa, pb, schema };
  }

  it('[SC-EXCLUSION-SKIP-ANCESTOR] skip-only parent run excludes the whole subtree but keeps siblings', () => {
    const { other, pa, pb, schema } = subtreeFixture();
    const suite = create(() => {}, schema as never) as any;
    const result = suite
      .focus({ skip: ['profile'] })
      .run({ profile: { a: 'a', b: 'b' }, other: 'o' });

    expect(pa).not.toHaveBeenCalled();
    expect(pb).not.toHaveBeenCalled();
    expect(other).toHaveBeenCalledTimes(1);
    expect(result.hasErrors()).toBe(false);
  });

  it('[SC-EXCLUSION-CHANGE-WINS] changed descendant still runs under a parent skip', () => {
    const { other, pa, pb, schema } = subtreeFixture();
    const result = runChangedSkip(
      schema,
      { profile: { a: 'a', b: 'b' }, other: 'o' },
      ['profile.b', 'other'],
      ['profile'],
    );

    // The explicitly changed descendant stays selected; the unselected
    // child of the skipped subtree stays silent; the changed sibling runs.
    expect(pa).not.toHaveBeenCalled();
    expect(pb).toHaveBeenCalledTimes(1);
    expect(other).toHaveBeenCalledTimes(1);
    expect(result.hasErrors()).toBe(false);
  });

  it('[SC-EXCLUSION-CHILD-SKIP] parent change with a child skip runs the sibling only', () => {
    const { pa, pb, schema } = subtreeFixture();
    const result = runChangedSkip(
      schema,
      { profile: { a: 'a', b: 'b' }, other: 'o' },
      ['profile'],
      ['profile.a'],
    );

    expect(pa).not.toHaveBeenCalled();
    expect(pb).toHaveBeenCalledTimes(1);
    expect(result.hasErrors()).toBe(false);
    expect(result.hasErrors('profile.a')).toBe(false);
  });

  it.each([
    ['duplicate', ['profile.a', 'profile.a']],
    ['overlapping', ['profile', 'profile.a']],
  ])('[SC-EXCLUSION-SKIP-SET] %s skips behave as a set', (_name, skip) => {
    const { pa, pb, schema } = subtreeFixture();
    const result = runChangedSkip(
      schema,
      { profile: { a: 'a', b: 'b' }, other: 'o' },
      ['profile.b'],
      skip,
    );

    expect(pa).not.toHaveBeenCalled();
    expect(pb).toHaveBeenCalledTimes(1);
    expect(result.hasErrors()).toBe(false);
  });

  it.each(['changed-first', 'focus-first'] as const)(
    '[SC-EXCLUSION-FANOUT-ORDER] %s runs every composed root once with skip+changed',
    order => {
      const skipped = vi.fn(() => true);
      const selected = vi.fn(() => true);
      const roots = [vi.fn(() => true), vi.fn(() => true)];
      const shape = enforce.shape({
        a: enforce.condition(skipped),
        b: enforce.condition(selected),
      });
      const schema = compose(
        shape as never,
        enforce.condition(roots[0]) as never,
        enforce.condition(roots[1]) as never,
      );
      const suite = create(() => {}, schema as never) as any;
      const data = { a: 'a', b: 'b' };
      const result =
        order === 'changed-first'
          ? suite
              .changed(['b'])
              .focus({ skip: ['a'] })
              .run(data)
          : suite
              .focus({ skip: ['a'] })
              .changed(['b'])
              .run(data);

      expect(skipped).not.toHaveBeenCalled();
      expect(selected).toHaveBeenCalledTimes(1);
      expect(roots[0]).toHaveBeenCalledTimes(1);
      expect(roots[1]).toHaveBeenCalledTimes(1);
      expect(result.hasErrors()).toBe(false);
    },
  );

  it('[SC-EXCLUSION-DEP-FANOUT] dependent still runs when its source is skipped', () => {
    const source = vi.fn(() => true);
    const dependent = vi.fn(() => true);
    const schema = enforce.shape({
      a: enforce.condition(source),
      // Type-level only: the runtime object keeps its dependency metadata.
      b: enforce
        .condition(dependent)
        .dependsOn(($: any) => $.a) as unknown as ReturnType<
        typeof enforce.condition
      >,
    });
    const calls: string[] = [];
    const suite = create(data => {
      mode(Modes.ALL);
      test('a', () => {
        calls.push('a');
        enforce((data as any).a).isString();
      });
      test('b', () => {
        calls.push('b');
        enforce((data as any).b).isString();
      });
    }, schema);
    const result = suite
      .changed('b')
      .focus({ skip: 'a' })
      .run({ a: 'a', b: 'b' });

    expect(source).not.toHaveBeenCalled();
    expect(dependent).toHaveBeenCalledTimes(1);
    expect(calls).toEqual(['b']);
    expect(result.hasErrors('a')).toBe(false);
    expect(result.hasErrors('b')).toBe(false);
  });
});

describe('schema contracts: exclusion attribution (EX04)', () => {
  const selectedOutcomes = [true, false];
  const rootOutcomes = [true, false];
  const behaviors: SkippedBehavior[] = ['pass', 'fail', 'throw'];

  const cases = selectedOutcomes.flatMap(selectedPass =>
    rootOutcomes.flatMap(rootPass =>
      behaviors.map(behavior => ({
        behavior,
        name:
          `selected-${selectedPass ? 'pass' : 'fail'}/` +
          `root-${rootPass ? 'pass' : 'fail'}/skipped-${behavior}`,
        rootPass,
        selectedPass,
      })),
    ),
  );

  it.each(cases)('[SC-EXCLUSION-ATTRIBUTION] $name', testCase => {
    const { behavior, rootPass, selectedPass } = testCase;
    const skipped = skippedPredicate(behavior);
    const selected = vi.fn(() => selectedPass);
    const root = vi.fn(() => rootPass);
    const inner = enforce.shape({
      a: enforce.condition(skipped),
      b: enforce.condition(selected),
    });
    const schema = compose(inner as never, enforce.condition(root) as never);
    const result = runChangedSkip(schema, { a: 'a', b: 'b' }, ['b'], ['a']);

    // The excluded predicate never fires, whatever it would have done.
    expect(skipped).not.toHaveBeenCalled();
    expect(selected).toHaveBeenCalledTimes(1);
    // Errors stay attributed: the skipped path is clean, the selected path
    // carries exactly its own verdict.
    expect(result.hasErrors('a')).toBe(false);
    expect(result.hasErrors('b')).toBe(!selectedPass);
    expect(result.hasErrors()).toBe(!selectedPass || !rootPass);
    if (selectedPass) {
      // With the selected work passing, the root verdict is preserved.
      expect(root).toHaveBeenCalledTimes(1);
    } else {
      // A failing selected sibling short-circuits the composed root; the
      // overall failure is still reported via the selected path above.
      expect(root).not.toHaveBeenCalled();
    }
  });
});

describe('schema contracts: partial optionality and strictness (EX06)', () => {
  it.each([
    ['missing', () => ({ b: 'b' })],
    [
      'own-undefined',
      () => {
        const data: Record<string, unknown> = { b: 'b' };
        Object.defineProperty(data, 'a', {
          configurable: true,
          enumerable: true,
          value: undefined,
          writable: true,
        });
        return data;
      },
    ],
    ['null', () => ({ a: null, b: 'b' })],
  ])(
    '[SC-EXCLUSION-PARTIAL-ABSENCE] skipped child with %s input never validates',
    (_name, makeData) => {
      const skipped = vi.fn(() => true);
      const selected = vi.fn(() => true);
      const schema = enforce.partial({
        a: enforce.condition(skipped),
        b: enforce.condition(selected),
      });
      const result = runChangedSkip(schema, makeData(), ['b'], ['a']);

      expect(skipped).not.toHaveBeenCalled();
      expect(selected).toHaveBeenCalledTimes(1);
      expect(result.hasErrors('a')).toBe(false);
      expect(result.hasErrors('b')).toBe(false);
      expect(result.hasErrors()).toBe(false);
    },
  );

  it('[SC-EXCLUSION-NONENUMERABLE] non-enumerable skipped key never executes', () => {
    const skipped = vi.fn(() => true);
    const selected = vi.fn(() => true);
    const schema = enforce.partial({
      a: enforce.condition(skipped),
      b: enforce.condition(selected),
    });
    const data: Record<string, unknown> = { b: 'b' };
    Object.defineProperty(data, 'a', {
      configurable: true,
      enumerable: false,
      value: 'a',
      writable: true,
    });
    const result = runChangedSkip(schema, data, ['b'], ['a']);

    expect(skipped).not.toHaveBeenCalled();
    expect(selected).toHaveBeenCalledTimes(1);
    expect(result.hasErrors()).toBe(false);
  });

  it.each(['shape', 'partial', 'loose'] as const)(
    '[SC-EXCLUSION-STRICTNESS] %s keeps native extra-key semantics on full runs',
    kind => {
      const suite = create(
        data => {
          mode(Modes.ALL);
          test('a', () => {
            enforce((data as any).a).isString();
          });
          test('b', () => {
            enforce((data as any).b).isString();
          });
        },
        (enforce as any)[kind]({
          a: enforce.isString(),
          b: enforce.isString(),
        }),
      );
      const result = suite.run({ a: 'a', b: 'b', zebra: 1 } as never);

      // shape/partial reject extra keys; loose allows them.
      expect(result.hasErrors()).toBe(kind !== 'loose');
    },
  );

  it.each(['shape', 'partial', 'loose'] as const)(
    '[SC-EXCLUSION-STRICTNESS] %s focused skip+changed run narrows extra keys out',
    kind => {
      const skipped = vi.fn(() => true);
      const selected = vi.fn(() => true);
      const schema = (enforce as any)[kind]({
        a: enforce.condition(skipped),
        b: enforce.condition(selected),
      });
      const result = runChangedSkip(
        schema,
        { a: 'a', b: 'b', zebra: 1 },
        ['b'],
        ['a'],
      );

      expect(skipped).not.toHaveBeenCalled();
      expect(selected).toHaveBeenCalledTimes(1);
      expect(result.hasErrors()).toBe(false);
    },
  );
});

describe('schema contracts: skip clearing of warnings and pending (EX11)', () => {
  function warnFixture() {
    const calls: string[] = [];
    const suite = create(
      data => {
        mode(Modes.ALL);
        test('a', () => {
          calls.push('a');
          warn();
          enforce((data as any).a).isNotBlank();
        });
        test('b', () => {
          calls.push('b');
          enforce((data as any).b).isNotBlank();
        });
      },
      enforce.shape({
        a: enforce.isString(),
        b: enforce.isString(),
      }),
    );
    return { calls, suite };
  }

  it('[SC-SKIP-CLEAR-WARN] skip clears a seeded warning while the dependent reruns', () => {
    const { calls, suite } = warnFixture();
    const seeded = suite.run({ a: '', b: 'ok' });
    expect(seeded.hasWarnings('a')).toBe(true);

    calls.length = 0;
    const result = suite
      .changed('b')
      .focus({ skip: 'a' })
      .run({ a: '', b: 'ok' });

    expect(calls).toEqual(['b']);
    expect(result.hasWarnings('a')).toBe(false);
    expect(result.hasErrors('a')).toBe(false);
    expect(result.hasWarnings()).toBe(false);
    expect(suite.get().hasWarnings('a')).toBe(false);
  });

  it('[SC-SKIP-CLEAR-PENDING] skip clears seeded pending work and stale settlement cannot restore it', async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>(resolve => {
      release = resolve;
    });
    const flush = () => new Promise<void>(resolve => setImmediate(resolve));
    const suite = create(
      data => {
        mode(Modes.ALL);
        test('a', async () => {
          await gate;
          enforce((data as any).a).isNotBlank();
        });
        test('b', () => {
          enforce((data as any).b).isNotBlank();
        });
      },
      enforce.shape({
        a: enforce.isString(),
        b: enforce.isString(),
      }),
    );

    suite.run({ a: '', b: 'ok' });
    expect(suite.get().isPending('a')).toBe(true);

    try {
      const result = suite
        .changed('b')
        .focus({ skip: 'a' })
        .run({ a: '', b: 'next' });

      expect(result.isPending('a')).toBe(false);
      expect(result.isPending()).toBe(false);
      expect(result.hasErrors('a')).toBe(false);

      release();
      await flush();
      await flush();

      expect(suite.get().isPending('a')).toBe(false);
      expect(suite.get().isPending()).toBe(false);
      expect(suite.get().hasErrors('a')).toBe(false);
    } finally {
      release();
      await flush();
    }
  });

  it('[SC-SKIPGROUP-RETAINS] group exclusion retains history unlike field skip', () => {
    const calls: string[] = [];
    const suite = create(
      data => {
        mode(Modes.ALL);
        group('account', () => {
          for (const field of ['a', 'b'] as const) {
            test(field, () => {
              calls.push(field);
              enforce((data as any)[field]).notEquals('bad');
            });
          }
        });
        group('other', () => {
          test('c', () => {
            calls.push('c');
            enforce((data as any).c).notEquals('bad');
          });
        });
      },
      enforce.shape({
        a: enforce.isString(),
        b: enforce.isString().dependsOn(($: any) => $.a),
        c: enforce.isString(),
      }),
    );

    suite.run({ a: 'bad', b: 'bad', c: 'bad' });
    calls.length = 0;
    const result = suite
      .changed(['a', 'c'])
      .focus({ skipGroup: 'account' })
      .run({ a: 'ok', b: 'ok', c: 'ok' });

    // Group exclusion keeps its distinct historical behavior: excluded
    // members do not run and their prior errors are retained.
    expect(calls).toEqual(['c']);
    expect(result.hasErrors('a')).toBe(true);
    expect(result.hasErrors('b')).toBe(true);
    expect(result.hasErrors('c')).toBe(false);
  });
});

describe('schema contracts: recovery after exclusion and root failures (EX12)', () => {
  function imperativeSuite(schema: unknown) {
    const calls: string[] = [];
    const suite = create(data => {
      mode(Modes.ALL);
      for (const field of ['a', 'b'] as const) {
        test(field, () => {
          calls.push(field);
          enforce((data as any)[field]).isString();
        });
      }
    }, schema as never);
    return { calls, suite };
  }

  it('[SC-RECOVERY-FALLBACK] valid run recovers after an unsupported-exclusion failure', () => {
    const skipped = vi.fn(() => true);
    const selected = vi.fn(() => true);
    const moved = (
      enforce.shape({
        a: enforce.condition(skipped),
        b: enforce.condition(selected),
      }) as unknown as { message(m: string): unknown }
    ).message('moved container');
    const { calls, suite } = imperativeSuite(moved) as unknown as {
      calls: string[];
      suite: any;
    };

    let thrown: unknown;
    try {
      suite.changed('b').focus({ skip: 'a' }).run({ a: 'a', b: 'b' });
    } catch (error) {
      thrown = error;
    }
    expect(thrown).toBeInstanceOf(SchemaExclusionError);
    expect(skipped).not.toHaveBeenCalled();

    skipped.mockClear();
    selected.mockClear();
    calls.length = 0;
    const recovered = suite.run({ a: 'a', b: 'b' });

    expect(recovered.hasErrors()).toBe(false);
    expect(recovered.isValid()).toBe(true);
    expect(recovered.value).toEqual({ a: 'a', b: 'b' });
    expect(selected).toHaveBeenCalled();
    expect(calls.sort()).toEqual(['a', 'b']);
  });

  it('[SC-RECOVERY-ROOT] valid run recovers after a root failure', () => {
    const root = vi.fn(() => false);
    const schema = compose(
      enforce.shape({
        a: enforce.isString(),
        b: enforce.isString(),
      }) as never,
      enforce.condition(root) as never,
    );
    const { suite } = imperativeSuite(schema) as unknown as { suite: any };

    const failed = suite.run({ a: 'a', b: 'b' });
    expect(root).toHaveBeenCalled();
    expect(failed.hasErrors()).toBe(true);
    expect(failed.isValid()).toBe(false);
    expect(failed.value).toBeUndefined();

    root.mockImplementation(() => true);
    const recovered = suite.run({ a: 'a', b: 'b' });
    expect(recovered.hasErrors()).toBe(false);
    expect(recovered.isValid()).toBe(true);
    expect(recovered.value).toEqual({ a: 'a', b: 'b' });
  });

  it('[SC-RECOVERY-ISOLATION] exclusion failure in one suite never leaks into another suite', () => {
    const schema = (
      enforce.shape({
        a: enforce.isString(),
        b: enforce.isString(),
      }) as unknown as { message(m: string): unknown }
    ).message('shared moved container');
    const first = imperativeSuite(schema).suite as any;
    const second = imperativeSuite(schema).suite as any;

    expect(() =>
      first.changed('b').focus({ skip: 'a' }).run({ a: 'a', b: 'b' }),
    ).toThrow(SchemaExclusionError);

    const healthy = second.run({ a: 'a', b: 'b' });
    expect(healthy.hasErrors()).toBe(false);
    expect(healthy.isValid()).toBe(true);
    expect(healthy.value).toEqual({ a: 'a', b: 'b' });

    const recovered = first.run({ a: 'a', b: 'b' });
    expect(recovered.hasErrors()).toBe(false);
    expect(recovered.isValid()).toBe(true);
    expect(recovered.value).toEqual({ a: 'a', b: 'b' });
  });
});

describe('schema contracts: only+skip route matrix remainder (T1 routes)', () => {
  type ContainerKind = 'shape' | 'partial' | 'loose';
  type RouteName =
    | 'changed-first'
    | 'focus-first'
    | 'only-first'
    | 'focus-only-first';

  const kinds: ContainerKind[] = ['shape', 'partial', 'loose'];
  const routes: RouteName[] = [
    'changed-first',
    'focus-first',
    'only-first',
    'focus-only-first',
  ];

  function runRoute(
    suite: any,
    route: RouteName,
    data: never,
  ): { hasErrors(field?: string): boolean } {
    if (route === 'changed-first')
      return suite
        .changed(['b'])
        .focus({ skip: ['a'] })
        .run(data);
    if (route === 'focus-first')
      return suite
        .focus({ skip: ['a'] })
        .changed(['b'])
        .run(data);
    if (route === 'only-first')
      return suite.only('b').focus({ skip: 'a' }).run(data);
    return suite.focus({ skip: 'a' }).only('b').run(data);
  }

  it.each(kinds.flatMap(kind => routes.map(route => ({ kind, route }))))(
    '[SC-EXCLUSION-ROUTE] $kind/$route excludes skipped, runs selected once',
    ({ kind, route }) => {
      const skipped = vi.fn(() => true);
      const selected = vi.fn(() => true);
      const schema = (enforce as any)[kind]({
        a: enforce.condition(skipped),
        b: enforce.condition(selected),
      });
      const suite: any = create((_data: unknown) => {}, schema as never);
      const result = runRoute(suite, route, { a: 'a', b: 'b' } as never);

      expect(skipped).not.toHaveBeenCalled();
      expect(selected).toHaveBeenCalledTimes(1);
      expect(result.hasErrors()).toBe(false);
      expect(result.hasErrors('a')).toBe(false);
      expect(result.hasErrors('b')).toBe(false);
    },
  );

  it.each(
    kinds.flatMap(kind =>
      routes.flatMap(route =>
        [true, false].map(rootPass => ({ kind, route, rootPass })),
      ),
    ),
  )(
    '[SC-EXCLUSION-ROUTE-COMPOSED] $kind/$route/root-$rootPass keeps root verdict',
    ({ kind, route, rootPass }) => {
      const skipped = vi.fn(() => true);
      const selected = vi.fn(() => true);
      const root = vi.fn(() => rootPass);
      const inner = (enforce as any)[kind]({
        a: enforce.condition(skipped),
        b: enforce.condition(selected),
      });
      const schema = compose(inner as never, enforce.condition(root) as never);
      const suite: any = create((_data: unknown) => {}, schema as never);
      const result = runRoute(suite, route, { a: 'a', b: 'b' } as never);

      expect(skipped).not.toHaveBeenCalled();
      expect(selected).toHaveBeenCalledTimes(1);
      expect(root).toHaveBeenCalledTimes(1);
      expect(result.hasErrors('a')).toBe(false);
      expect(result.hasErrors('b')).toBe(false);
      expect(result.hasErrors()).toBe(!rootPass);
    },
  );
});

describe('schema contracts: tuple and array placements (T1 placement)', () => {
  function tupleFixture() {
    const first = vi.fn(() => true);
    const second = vi.fn(() => true);
    const schema = enforce.shape({
      pair: enforce.tuple(enforce.condition(first), enforce.condition(second)),
    });
    return { first, schema, second };
  }

  it.each(['changed-first', 'focus-first'] as const)(
    '[SC-EXCLUSION-TUPLE] %s skips tuple.0 and runs the sibling only',
    order => {
      const { first, schema, second } = tupleFixture();
      const suite: any = create((_data: unknown) => {}, schema as never);
      const data = { pair: ['a', 'b'] } as never;
      const result =
        order === 'changed-first'
          ? suite.changed('pair.1').focus({ skip: 'pair.0' }).run(data)
          : suite.focus({ skip: 'pair.0' }).changed('pair.1').run(data);

      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledTimes(1);
      expect(result.hasErrors()).toBe(false);
      expect(result.hasErrors('pair.0')).toBe(false);
      expect(result.hasErrors('pair.1')).toBe(false);
    },
  );

  it('[SC-EXCLUSION-TUPLE] parent tuple change with a member skip runs the sibling only', () => {
    const { first, schema, second } = tupleFixture();
    const suite: any = create((_data: unknown) => {}, schema as never);
    const result = suite
      .changed('pair')
      .focus({ skip: 'pair.0' })
      .run({ pair: ['a', 'b'] } as never);

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    expect(result.hasErrors()).toBe(false);
  });

  function arrayComposedFixture() {
    const skipped = vi.fn(() => true);
    const selected = vi.fn(() => true);
    const root = vi.fn(() => true);
    const callback = vi.fn();
    const schema = compose(
      enforce.shape({
        rows: enforce.isArrayOf(
          enforce.shape({
            a: enforce.condition(skipped),
            b: enforce.condition(selected),
          }),
        ),
      }) as never,
      enforce.condition(root) as never,
    );
    const suite: any = create((_data: unknown) => {
      callback(_data);
    }, schema as never);
    return { callback, root, selected, skipped, suite };
  }

  it('[SC-EXCLUSION-ARRAY-COMPOSED] concrete array skip under composition fails closed', () => {
    const { callback, root, selected, skipped, suite } = arrayComposedFixture();
    let thrown: unknown;
    try {
      suite
        .changed('rows.0.b')
        .focus({ skip: 'rows.0.a' })
        .run({ rows: [{ a: 'a0', b: 'b0' }] } as never);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(SchemaExclusionError);
    expect(skipped).not.toHaveBeenCalled();
    expect(selected).not.toHaveBeenCalled();
    expect(root).not.toHaveBeenCalled();
    expect(callback).not.toHaveBeenCalled();
  });

  it('[SC-EXCLUSION-TUPLE-COMPOSED] tuple member skip under composition fails closed', () => {
    const first = vi.fn(() => true);
    const second = vi.fn(() => true);
    const root = vi.fn(() => true);
    const callback = vi.fn();
    const schema = compose(
      enforce.shape({
        pair: enforce.tuple(
          enforce.condition(first),
          enforce.condition(second),
        ),
      }) as never,
      enforce.condition(root) as never,
    );
    const suite: any = create((_data: unknown) => {
      callback(_data);
    }, schema as never);
    let thrown: unknown;
    try {
      suite
        .changed('pair.1')
        .focus({ skip: 'pair.0' })
        .run({ pair: ['a', 'b'] } as never);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(SchemaExclusionError);
    expect(first).not.toHaveBeenCalled();
    expect(second).not.toHaveBeenCalled();
    expect(root).not.toHaveBeenCalled();
    expect(callback).not.toHaveBeenCalled();
  });
});

describe('schema contracts: skip-all, empty selection, nonexistent paths (T1 #7)', () => {
  function shapeSpies() {
    const skipped = vi.fn(() => true);
    const selected = vi.fn(() => true);
    const schema = enforce.shape({
      a: enforce.condition(skipped),
      b: enforce.condition(selected),
    });
    return { schema, selected, skipped };
  }

  it('[SC-EXCLUSION-SKIP-ALL] changed+skip-all runs nothing and invents no validity', () => {
    const { schema, selected, skipped } = shapeSpies();
    const suite: any = create((_data: unknown) => {}, schema as never);
    const result = suite
      .changed('b')
      .focus({ skip: true })
      .run({ a: 'a', b: 'b' } as never);

    expect(skipped).not.toHaveBeenCalled();
    expect(selected).not.toHaveBeenCalled();
    expect(result.hasErrors()).toBe(false);
    expect(result.hasErrors('a')).toBe(false);
    expect(result.hasErrors('b')).toBe(false);
    expect(result.value).toBeUndefined();
  });

  it('[SC-EXCLUSION-EMPTY] changed([]) runs nothing and invents no validity', () => {
    const { schema, selected, skipped } = shapeSpies();
    const suite: any = create((_data: unknown) => {}, schema as never);
    const result = suite.changed([]).run({ a: 'a', b: 'b' } as never);

    expect(skipped).not.toHaveBeenCalled();
    expect(selected).not.toHaveBeenCalled();
    expect(result.hasErrors()).toBe(false);
    expect(result.hasErrors('a')).toBe(false);
    expect(result.value).toBeUndefined();
  });

  it('[SC-EXCLUSION-EMPTY] changed([]) retains a seeded failure without execution', () => {
    const failing = vi.fn(() => false);
    const passing = vi.fn(() => true);
    const schema = enforce.shape({
      a: enforce.condition(failing),
      b: enforce.condition(passing),
    });
    const suite: any = create((_data: unknown) => {}, schema as never);
    expect(suite.run({ a: 'bad', b: 'ok' } as never).hasErrors('a')).toBe(true);

    failing.mockClear();
    passing.mockClear();
    const retained = suite.changed([]).run({ a: 'good', b: 'next' } as never);

    expect(failing).not.toHaveBeenCalled();
    expect(passing).not.toHaveBeenCalled();
    expect(retained.hasErrors('a')).toBe(true);
    expect(retained.hasErrors('b')).toBe(false);
  });

  it('[SC-EXCLUSION-NONEXISTENT] changed+nonexistent skip runs the selection only', () => {
    const { schema, selected, skipped } = shapeSpies();
    const suite: any = create((_data: unknown) => {}, schema as never);
    const result = suite
      .changed(['b'])
      .focus({ skip: ['nope.missing'] })
      .run({ a: 'a', b: 'b' } as never);

    expect(skipped).not.toHaveBeenCalled();
    expect(selected).toHaveBeenCalledTimes(1);
    expect(result.hasErrors()).toBe(false);
  });

  it('[SC-EXCLUSION-NONEXISTENT] skip-only with an unknown path is a full-run no-op', () => {
    const { schema, selected, skipped } = shapeSpies();
    const suite: any = create((_data: unknown) => {}, schema as never);
    const result = suite
      .focus({ skip: ['nope.missing'] })
      .run({ a: 'a', b: 'b' } as never);

    expect(skipped).toHaveBeenCalledTimes(1);
    expect(selected).toHaveBeenCalledTimes(1);
    expect(result.hasErrors()).toBe(false);
  });

  it('[SC-EXCLUSION-NONEXISTENT] changed([])+skip runs nothing', () => {
    const { schema, selected, skipped } = shapeSpies();
    const suite: any = create((_data: unknown) => {}, schema as never);
    const result = suite
      .changed([])
      .focus({ skip: 'a' })
      .run({ a: 'a', b: 'b' } as never);

    expect(skipped).not.toHaveBeenCalled();
    expect(selected).not.toHaveBeenCalled();
    expect(result.hasErrors()).toBe(false);
  });
});

describe('schema contracts: plain nested skip-only (P1)', () => {
  function nestedFixture(
    container: 'shape' | 'partial' | 'loose',
    excludedBehavior: SkippedBehavior = 'throw',
  ) {
    const excluded = skippedPredicate(excludedBehavior);
    const sibling = vi.fn(() => true);
    const outer = vi.fn(() => true);
    const inner =
      container === 'shape'
        ? enforce.shape({
            a: enforce.condition(excluded),
            b: enforce.condition(sibling),
          })
        : container === 'partial'
          ? enforce.partial({
              a: enforce.condition(excluded),
              b: enforce.condition(sibling),
            })
          : enforce.loose({
              a: enforce.condition(excluded),
              b: enforce.condition(sibling),
            });
    const schema = enforce.shape({
      profile: inner as never,
      other: enforce.condition(outer),
    });
    return { excluded, outer, schema, sibling };
  }

  it.each(['shape', 'partial', 'loose'] as const)(
    '[SC-NESTED-SKIP] plain %s skip-only never executes the nested excluded validator',
    container => {
      const { excluded, outer, schema, sibling } = nestedFixture(container);
      const suite: any = create((_data: unknown) => {}, schema as never);
      const result = suite
        .focus({ skip: 'profile.a' })
        .run({ profile: { a: 'a', b: 'b' }, other: 'o' } as never);
      expect(excluded).not.toHaveBeenCalled();
      expect(sibling).toHaveBeenCalledTimes(1);
      expect(outer).toHaveBeenCalledTimes(1);
      expect(result.hasErrors()).toBe(false);
    },
  );

  it.each(['shape', 'partial', 'loose'] as const)(
    '[SC-NESTED-SKIP] plain %s only(profile)+skip(profile.a) excludes nested while keeping the parent',
    container => {
      const { excluded, outer, schema, sibling } = nestedFixture(container);
      const suite: any = create((_data: unknown) => {}, schema as never);
      const result = suite
        .only('profile')
        .focus({ skip: 'profile.a' })
        .run({ profile: { a: 'a', b: 'b' }, other: 'o' } as never);
      expect(excluded).not.toHaveBeenCalled();
      expect(sibling).toHaveBeenCalledTimes(1);
      expect(result.hasErrors()).toBe(false);
      expect(outer).not.toHaveBeenCalled();
    },
  );
});
