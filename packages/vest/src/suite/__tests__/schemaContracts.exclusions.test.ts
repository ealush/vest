import { describe, expect, it, vi } from 'vitest';

import { FocusedSchemaMappingError, SchemaExclusionError, compose } from 'n4s';

import { create, enforce, mode, Modes, test } from '../../vest';
import { each } from '../../isolates/each';

type SkippedBehavior = 'pass' | 'fail' | 'throw';
type ContainerKind = 'shape' | 'partial' | 'loose';
type Placement = 'top' | 'nested' | 'subtree';
type RunState = 'fresh' | 'retained';

const containers: Record<
  ContainerKind,
  (members: Record<string, unknown>) => unknown
> = {
  shape: members => enforce.shape(members as never),
  partial: members => enforce.partial(members as never),
  loose: members => enforce.loose(members as never),
};

function skippedPredicate(behavior: SkippedBehavior) {
  if (behavior === 'pass') return vi.fn(() => true);
  if (behavior === 'fail') return vi.fn(() => false);
  return vi.fn(() => {
    throw new Error('excluded predicate executed');
  });
}

type Cell = {
  affected: string[];
  data: Record<string, unknown>;
  schema: unknown;
  skip: string[];
  skippedPath: string;
};

function buildCell(
  kind: ContainerKind,
  placement: Placement,
  skipped: ReturnType<typeof vi.fn>,
  selected: ReturnType<typeof vi.fn>,
  root: ReturnType<typeof vi.fn>,
): Cell {
  const members = {
    a: enforce.condition(skipped),
    b: enforce.condition(selected),
  };
  const inner = containers[kind](members);
  if (placement === 'top') {
    return {
      affected: ['b'],
      data: { a: 'a', b: 'b' },
      schema: compose(inner as never, enforce.condition(root) as never),
      skip: ['a'],
      skippedPath: 'a',
    };
  }
  const outer = enforce.shape({ profile: inner as never });
  const data = { profile: { a: 'a', b: 'b' } };
  const schema = compose(outer as never, enforce.condition(root) as never);
  if (placement === 'nested') {
    return {
      affected: ['profile.b'],
      data,
      schema,
      skip: ['profile.a'],
      skippedPath: 'profile.a',
    };
  }
  return {
    affected: ['profile'],
    data,
    schema,
    skip: ['profile.a'],
    skippedPath: 'profile.a',
  };
}

const kinds: ContainerKind[] = ['shape', 'partial', 'loose'];
const placements: Placement[] = ['top', 'nested', 'subtree'];
const states: RunState[] = ['fresh', 'retained'];
const roots = [true, false];
const behaviors: SkippedBehavior[] = ['pass', 'fail', 'throw'];

type MatrixCase = {
  behavior: SkippedBehavior;
  kind: ContainerKind;
  name: string;
  placement: Placement;
  rootPass: boolean;
  state: RunState;
};

const matrixCases: MatrixCase[] = [];
for (const kind of kinds) {
  for (const placement of placements) {
    for (const state of states) {
      for (const rootPass of roots) {
        for (const behavior of behaviors) {
          matrixCases.push({
            behavior,
            kind,
            name: `${kind}/${placement}/${state}/root-${rootPass ? 'pass' : 'fail'}/skipped-${behavior}`,
            placement,
            rootPass,
            state,
          });
        }
      }
    }
  }
}

describe('schema contracts: exclusion matrix', () => {
  it.each(matrixCases)('[SC-EXCLUSION-MATRIX] $name', testCase => {
    const { behavior, kind, placement, rootPass, state } = testCase;
    const skipped = skippedPredicate(behavior);
    const selected = vi.fn(() => true);
    const root = vi.fn(() => rootPass);
    const cell = buildCell(kind, placement, skipped, selected, root);
    // Dynamic string arrays cannot satisfy the suite's literal field
    // vocabulary; the contract under test is runtime execution behavior.
    const suite = create(() => {}, cell.schema as never) as unknown as {
      changed(fields: string[]): {
        focus(modifiers: { skip: string[] }): {
          run(data: unknown): {
            hasErrors(field?: string): boolean;
          };
        };
      };
      run(data: unknown): unknown;
    };

    if (state === 'retained') {
      suite.run(cell.data);
      skipped.mockClear();
      selected.mockClear();
      root.mockClear();
    }

    const result = suite
      .changed(cell.affected)
      .focus({ skip: cell.skip })
      .run(cell.data);

    expect(skipped).not.toHaveBeenCalled();
    expect(selected).toHaveBeenCalledTimes(1);
    expect(root).toHaveBeenCalledTimes(1);
    expect(result.hasErrors()).toBe(!rootPass);
    expect(result.hasErrors(cell.skippedPath)).toBe(false);
  });

  it('[SC-SKIP-FALLBACK] public partial-root counterpart executes selected work only', () => {
    const skipped = vi.fn(() => true);
    const selected = vi.fn(() => true);
    const calls: string[] = [];
    let callbackData: Record<string, unknown> | undefined;
    const schema = compose(
      enforce.partial({
        a: enforce.condition(skipped),
        b: enforce.condition(selected),
      }) as never,
      enforce.condition(() => true) as never,
    );
    const suite = create(data => {
      mode(Modes.ALL);
      callbackData = data as Record<string, unknown>;
      test('a', () => {
        calls.push('a');
        enforce(data.a).isString();
      });
      test('b', () => {
        calls.push('b');
        enforce(data.b).isString();
      });
    }, schema as never);

    const result = suite
      .changed('b')
      .focus({ skip: 'a' })
      .run({ a: 'a', b: 'b' } as never);

    expect(skipped).not.toHaveBeenCalled();
    expect(selected).toHaveBeenCalledTimes(1);
    expect(calls).toEqual(['b']);
    expect(result.hasErrors()).toBe(false);
    // A run with skipped tests is not fully valid, so result.value is
    // absent by design; the detached callback data carries both keys.
    expect(Object.hasOwn(callbackData as object, 'a')).toBe(true);
    expect(Object.hasOwn(callbackData as object, 'b')).toBe(true);
    expect((callbackData as Record<string, unknown>)?.b).toBe('b');
  });

  it('[SC-EXCLUSION-OPAQUE] moved-chain fallback with intersecting skip fails closed', () => {
    const skipped = vi.fn(() => true);
    const selected = vi.fn(() => true);
    // .message() extends the shape chain after its baseline snapshot, so a
    // rebuild would silently drop the container message: the fallback must
    // reject before running excluded work instead.
    const moved = (
      enforce.shape({
        a: enforce.condition(skipped),
        b: enforce.condition(selected),
      }) as unknown as { message(m: string): unknown }
    ).message('moved container');
    // Dynamic field names cannot satisfy the suite's literal field
    // vocabulary; the contract under test is runtime fail-closed behavior.
    const suite = create(() => {}, moved as never) as unknown as {
      changed(field: string): {
        focus(modifiers: { skip: string }): {
          run(data: unknown): unknown;
        };
      };
    };

    let thrown: unknown;
    try {
      suite.changed('b').focus({ skip: 'a' }).run({ a: 'a', b: 'b' });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(SchemaExclusionError);
    expect((thrown as SchemaExclusionError).code).toBe(
      'SCHEMA_EXCLUSION_UNSUPPORTED',
    );
    expect(skipped).not.toHaveBeenCalled();
  });

  it('[SC-EXCLUSION-OPAQUE] unwitnessed union focus throws a stable mapping error', () => {
    const schema = enforce.shape({
      rows: enforce.isArrayOf(
        enforce.isNumeric().toNumber(),
        enforce.isBoolean(),
      ),
    });
    const suite = create(data => {
      test('rows.0', () => true);
      void data;
    }, schema as never);

    let thrown: unknown;
    try {
      suite.changed('rows.0').run({ rows: ['2', true, '3'] } as never);
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(FocusedSchemaMappingError);
    expect((thrown as FocusedSchemaMappingError).code).toBe(
      'FOCUSED_SCHEMA_MAPPING_UNWITNESSED_UNION',
    );
    expect(String((thrown as Error).message)).toMatch(/mapping|focused|union/i);
  });
});

describe('schema contracts: exclusion interactions', () => {
  it.each([false, true])(
    '[SC-EXCLUSION-COMPOSE] root %s preserves exclusion with every root linked',
    rootFirst => {
      const skipped = vi.fn(() => true);
      const selected = vi.fn(() => true);
      const roots = [vi.fn(() => true), vi.fn(() => true)];
      const shape = enforce.shape({
        a: enforce.condition(skipped),
        b: enforce.condition(selected),
      });
      const chain = rootFirst
        ? [enforce.condition(roots[0]), shape, enforce.condition(roots[1])]
        : [shape, enforce.condition(roots[0]), enforce.condition(roots[1])];
      const schema = compose(...(chain as never[]));
      const result = runPublicChanged(schema, { a: 'a', b: 'b' }, ['b'], ['a']);

      expect(skipped).not.toHaveBeenCalled();
      expect(selected).toHaveBeenCalledTimes(1);
      expect(roots[0]).toHaveBeenCalledTimes(1);
      expect(roots[1]).toHaveBeenCalledTimes(1);
      expect(result.hasErrors()).toBe(false);
    },
  );

  it('[SC-EXCLUSION-COMPOSE] nested composition keeps every root and drops the skip', () => {
    const skipped = vi.fn(() => true);
    const selected = vi.fn(() => true);
    const inner = vi.fn(() => true);
    const outer = vi.fn(() => true);
    const schema = compose(
      compose(
        enforce.shape({
          a: enforce.condition(skipped),
          b: enforce.condition(selected),
        }) as never,
        enforce.condition(inner) as never,
      ),
      enforce.condition(outer) as never,
    );
    const result = runPublicChanged(schema, { a: 'a', b: 'b' }, ['b'], ['a']);

    expect(skipped).not.toHaveBeenCalled();
    expect(selected).toHaveBeenCalledTimes(1);
    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).toHaveBeenCalledTimes(1);
    expect(result.hasErrors()).toBe(false);
  });

  it('[SC-EXCLUSION-ARRAY] changed item runs while skipped and sibling predicates stay silent', () => {
    const skipped = vi.fn(() => true);
    const selected = vi.fn(() => true);
    const schema = enforce.shape({
      rows: enforce.isArrayOf(
        enforce.shape({
          a: enforce.condition(skipped),
          b: enforce.condition(selected),
        }),
      ),
    });
    const data = {
      rows: [
        { a: 'a0', b: 'b0' },
        { a: 'a1', b: 'b1' },
      ],
    };
    const result = runPublicChanged(schema, data, ['rows.1.b'], ['rows.1.a']);

    expect(skipped).not.toHaveBeenCalled();
    // Only the changed member runs: the sibling item is untouched.
    expect(selected).toHaveBeenCalledTimes(1);
    expect(result.hasErrors()).toBe(false);
  });

  it('[SC-EXCLUSION-ARRAY] whole-item change with a skipped child runs the sibling only', () => {
    const skipped = vi.fn(() => true);
    const selected = vi.fn(() => true);
    const schema = enforce.shape({
      rows: enforce.isArrayOf(
        enforce.shape({
          a: enforce.condition(skipped),
          b: enforce.condition(selected),
        }),
      ),
    });
    const result = runPublicChanged(
      schema,
      { rows: [{ a: 'a', b: 'b' }] },
      ['rows.0'],
      ['rows.0.a'],
    );

    expect(skipped).not.toHaveBeenCalled();
    expect(selected).toHaveBeenCalledTimes(1);
    expect(result.hasErrors()).toBe(false);
  });

  it('[SC-EXCLUSION-ARRAY] sibling error paths track current indices after reorder', () => {
    const schema = enforce.shape({
      rows: enforce.isArrayOf(
        enforce.shape({
          id: enforce.isString(),
          v: enforce.isString(),
        }),
      ),
    });
    const suite = create(data => {
      each(
        (data as { rows: { id: string; v: string }[] }).rows,
        (row, index) => {
          test(
            `rows.${index}.v`,
            () => {
              enforce(row.v).isNotBlank();
            },
            `${row.id}:v`,
          );
        },
      );
    }, schema as never);
    suite.run({
      rows: [
        { id: 'a', v: '' },
        { id: 'b', v: 'ok' },
      ],
    });
    const after = suite.changed('rows.1.v').run({
      rows: [
        { id: 'b', v: 'ok' },
        { id: 'a', v: '' },
      ],
    }) as unknown as { hasErrors(field?: string): boolean };

    // Keyed identity follows the moved item: the error tracks item 'a' to
    // its new index instead of sticking to the old path.
    expect(after.hasErrors('rows.0.v')).toBe(false);
    expect(after.hasErrors('rows.1.v')).toBe(true);
  });

  it('[SC-EXCLUSION-PARSER] skipped parsed child maps honestly without validation', () => {
    const seen: unknown[] = [];
    const schema = enforce.shape({
      age: enforce.isNumeric().toNumber(),
      note: enforce.isString(),
    });
    const suite = create(data => {
      seen.push(data);
    }, schema as never);
    suite.run({ age: '42', note: 'first' });
    seen.length = 0;
    const result = suite
      .changed('note')
      .focus({ skip: 'age' })
      .run({ age: '43', note: 'second' });

    expect(result.hasErrors()).toBe(false);
    // The excluded field was mapped (parsed) but never validated: its
    // value is honestly parsed input restored from the prior complete
    // run, not raw strings and not fresh validation.
    expect(seen[0]).toEqual({ age: 42, note: 'second' });
  });

  it('[SC-EXCLUSION-UNION] witnessed union survives a dependent change without reprobing', () => {
    const suite = create(
      data => {
        test('note', () => true);
        void data;
      },
      enforce.shape({
        rows: enforce.isArrayOf(
          enforce.isNumeric().toNumber(),
          enforce.isBoolean(),
        ),
        note: enforce.isString(),
      }) as never,
    );
    // Full run establishes the branch witness; the dependent change keeps
    // the same union input, so the retained witness is reused honestly.
    // Branch-changing inputs need witness invalidation (open MP03).
    suite.run({ rows: ['1', true], note: 'first' });
    const result = suite
      .changed('note')
      .run({ rows: ['1', true], note: 'second' });

    expect(result.isValid()).toBe(true);
    expect(result.value).toEqual({ rows: [1, true], note: 'second' });
  });

  it('[SC-EXCLUSION-UNION] skip on an unwitnessed union still throws before callbacks', () => {
    const callback = vi.fn();
    const suite = create(
      data => {
        callback(data);
        test('note', () => true);
      },
      enforce.shape({
        rows: enforce.isArrayOf(
          enforce.isNumeric().toNumber(),
          enforce.isBoolean(),
        ),
        note: enforce.isString(),
      }) as never,
    );
    expect(() =>
      suite
        .changed('note')
        .focus({ skip: 'rows' })
        .run({ rows: ['2'], note: 'ok' }),
    ).toThrow(/mapping|union|focused/i);
    expect(callback).not.toHaveBeenCalled();
  });
  it('[SC-COPY-ISOLATION] mutating a published copy touches nothing else', () => {
    const callbacks: Record<string, unknown>[] = [];
    const callerInput = { note: 'first', payload: { nested: 1 } };
    const suite = create(
      data => {
        callbacks.push(data as Record<string, unknown>);
        test('note', () => true);
      },
      enforce.shape({
        note: enforce.isString(),
        payload: enforce.shape({ nested: enforce.isNumeric() }),
      }) as never,
    );

    const first = suite.run(callerInput as never);
    expect(first.isValid()).toBe(true);
    // Mutate the owned nested copy (top-level results are frozen).
    (
      (first.value as Record<string, unknown>).payload as Record<
        string,
        unknown
      >
    ).nested = 999;
    (
      (callbacks[0] as Record<string, unknown>).payload as Record<
        string,
        unknown
      >
    ).nested = 998;

    const second = suite
      .changed('note')
      .run({ note: 'second', payload: { nested: 1 } });
    expect(second.isValid()).toBe(true);
    expect(second.value).toEqual({ note: 'second', payload: { nested: 1 } });
    expect(callbacks[1]).toEqual({ note: 'second', payload: { nested: 1 } });
    // The caller's object was never aliased by any public copy.
    expect(callerInput).toEqual({ note: 'first', payload: { nested: 1 } });
  });
});

function runPublicChanged(
  schema: unknown,
  data: Record<string, unknown>,
  affected: string[],
  skip: string[],
): { hasErrors(field?: string): boolean } {
  const suite = create(() => {}, schema as never) as unknown as {
    changed(fields: string[]): {
      focus(modifiers: { skip: string[] }): {
        run(data: unknown): { hasErrors(field?: string): boolean };
      };
    };
  };
  return suite.changed(affected).focus({ skip }).run(data);
}

describe('schema contracts: runner retained-path utilities', () => {
  it('[SC-MERGE] skip-only run with an array index skip repairs from retention', () => {
    const calls: string[] = [];
    const schema = enforce.shape({
      rows: enforce.isArrayOf(enforce.isNumeric().toNumber()),
      note: enforce.isString(),
    });
    const suite = create(data => {
      calls.push('ran');
      test('note', () => true);
      void data;
    }, schema as never);
    suite.run({ rows: ['1', '2'], note: 'first' });
    calls.length = 0;
    const result = suite
      .focus({ skip: 'rows.0' })
      .run({ rows: ['9', '2'], note: 'second' });
    expect(result.hasErrors()).toBe(false);
    expect(calls).toEqual(['ran']);
  });

  it('[SC-MERGE] unsafe skip names never corrupt retained mappings', () => {
    const seen: unknown[] = [];
    const suite = create(
      data => {
        seen.push(data);
        test('note', () => true);
      },
      enforce.shape({ note: enforce.isString() }) as never,
    );
    suite.run({ note: 'first' });
    const result = suite.focus({ skip: '__proto__' }).run({ note: 'second' });
    expect(result.hasErrors()).toBe(false);
    expect(seen[1]).toEqual({ note: 'second' });
    expect((seen[1] as Record<string, unknown>).note).toBe('second');
  });

  it('[SC-MERGE] skipped union regions reuse coverage without probing', () => {
    const suite = create(
      data => {
        test('note', () => true);
        void data;
      },
      enforce.shape({
        rows: enforce.isArrayOf(
          enforce.isNumeric().toNumber(),
          enforce.isBoolean(),
        ),
        note: enforce.isString(),
      }) as never,
    );
    suite.run({ rows: ['1', true], note: 'first' });
    const result = suite
      .focus({ skip: 'note' })
      .run({ rows: ['1', true], note: 'second' });
    expect(result.hasErrors()).toBe(false);
  });

  it('[SC-MERGE] retained primitive members reuse mapping without revalidation', () => {
    const seen: unknown[] = [];
    const schema = enforce.shape({
      rows: enforce.isArrayOf(enforce.isString()),
    });
    const suite = create(data => {
      seen.push(data);
    }, schema as never);
    suite.run({ rows: ['a', 'b'] });
    const result = suite.changed('rows.0').run({ rows: ['c', 'b'] });
    expect(result.hasErrors()).toBe(false);
    expect(seen[1]).toEqual({ rows: ['c', 'b'] });
  });

  it('[SC-MERGE] grown arrays replace the retained array wholesale', () => {
    const seen: unknown[] = [];
    const schema = enforce.shape({
      rows: enforce.isArrayOf(enforce.isNumeric().toNumber()),
    });
    const suite = create(data => {
      seen.push(data);
    }, schema as never);
    suite.run({ rows: ['1', '2'] });
    const result = suite.changed('rows.0').run({ rows: ['3', '2', '9'] });
    expect(result.hasErrors()).toBe(false);
    const delivered = seen[1] as { rows: unknown[] };
    // The changed member is parsed; the wholesale path is exercised.
    // OPEN DEFECT: unexecuted members of a resized array keep raw input
    // ('2'/'9' unparsed) instead of retained parsed values or fresh
    // mapping. Positional identity breaks on insert/remove; do not treat
    // this output as fully parsed until MP01 covers resized mapping.
    expect(delivered.rows[0]).toBe(3);
    expect(delivered.rows).toHaveLength(3);
  });

  it('[SC-MERGE] hostile affected paths cannot corrupt retained mappings', () => {
    const seen: unknown[] = [];
    const schema = enforce.shape({
      rows: enforce.isArrayOf(enforce.isString()),
    });
    const suite = create(data => {
      seen.push(data);
      test('rows', () => true);
    }, schema as never);
    suite.run({ rows: ['a'] });
    const result = suite.changed('rows.__proto__').run({ rows: ['b'] });
    expect(result.hasErrors('rows')).toBe(false);
    // OPEN (SE01): hostile affected paths are ignored — the callback keeps
    // retained data instead of the current input. Safe (no corruption) but
    // stale; reject-vs-ignore needs an explicit product rule.
    expect(seen[1]).toEqual({ rows: ['a'] });
  });

  it('[SC-MERGE] foreign schemas deliver raw input on focused runs', () => {
    const seen: unknown[] = [];
    const foreign = {
      run: (value: unknown) => [{ pass: true, type: value }],
    };
    const suite = create(data => {
      seen.push(data);
      test('a', () => true);
    }, foreign as never);
    suite.run({ a: 1 });
    const result = suite.changed('a').run({ a: 2 });
    expect(result.hasErrors()).toBe(false);
    expect(seen[1]).toEqual({ a: 2 });
  });

  it('[SC-MERGE] typeless foreign verdicts fall back to raw input', () => {
    const seen: unknown[] = [];
    const foreign = {
      run: () => [{ pass: true }],
    };
    const suite = create(data => {
      seen.push(data);
      test('a', () => true);
    }, foreign as never);
    const result = suite.changed('a').run({ a: 2 });
    expect(result.hasErrors()).toBe(false);
    expect(seen[0]).toEqual({ a: 2 });
  });
});

it('[SC-MERGE] nested skips under scalar leaves are ignored safely', () => {
  const seen: unknown[] = [];
  const suite = create(
    data => {
      seen.push(data);
      test('a', () => true);
    },
    enforce.shape({
      a: enforce.isString(),
      b: enforce.isString(),
    }) as never,
  );
  suite.run({ a: 'x', b: 'y' });
  const result = suite
    .changed('b')
    .focus({ skip: 'a.deeper.still' })
    .run({ a: 'x', b: 'z' });
  expect(result.hasErrors()).toBe(false);
  expect(seen[1]).toEqual({ a: 'x', b: 'z' });
});

it('[SC-MERGE] unsafe skip names never touch retained mappings', () => {
  const seen: unknown[] = [];
  const suite = create(
    data => {
      seen.push(data);
      test('note', () => true);
    },
    enforce.shape({ note: enforce.isString() }) as never,
  );
  suite.run({ note: 'first' });
  const result = suite
    .changed('note')
    .focus({ skip: '__proto__.x' })
    .run({ note: 'second' });
  expect(result.hasErrors()).toBe(false);
  expect(seen[1]).toEqual({ note: 'second' });
});

it('[SC-MERGE] nested arrays merge through array copies', () => {
  const seen: unknown[] = [];
  const schema = enforce.shape({
    matrix: enforce.isArrayOf(enforce.isArrayOf(enforce.isString())),
  });
  const suite = create(data => {
    seen.push(data);
  }, schema as never);
  suite.run({ matrix: [['a', 'b']] });
  const result = suite.changed('matrix.0.1').run({ matrix: [['a', 'c']] });
  expect(result.hasErrors()).toBe(false);
  expect(seen[1]).toEqual({ matrix: [['a', 'c']] });
});

it('[SC-MERGE] added keys materialize without disturbing retention', () => {
  const seen: unknown[] = [];
  const schema = enforce.shape({
    kept: enforce.isString(),
    extra: enforce.isString(),
  });
  const suite = create(data => {
    seen.push(data);
    test('extra', () => true);
  }, schema as never);
  suite.run({ kept: 'k' } as never);
  const result = suite.changed('extra').run({ kept: 'k', extra: 'new' });
  expect(result.hasErrors()).toBe(false);
  expect(seen[1]).toEqual({ kept: 'k', extra: 'new' });
});

it('[SC-MERGE] oversized numeric segments stay bindings, not indices', () => {
  const seen: unknown[] = [];
  const schema = enforce.shape({
    dict: enforce.record(enforce.isString()),
  });
  const suite = create(data => {
    seen.push(data);
    test('dict', () => true);
  }, schema as never);
  const key = '9007199254740993';
  suite.run({ dict: { [key]: 'a' } });
  const result = suite.changed(`dict.${key}`).run({ dict: { [key]: 'b' } });
  expect(result.hasErrors()).toBe(false);
  expect(seen[1]).toEqual({ dict: { [key]: 'b' } });
});

describe('schema contracts: union coverage directions', () => {
  it('[SC-EXCLUSION-OPAQUE] ancestor focus covers union members without throwing', () => {
    const suite = create(
      data => {
        test('rows', () => true);
        void data;
      },
      enforce.shape({
        rows: enforce.isArrayOf(
          enforce.isNumeric().toNumber(),
          enforce.isBoolean(),
        ),
      }) as never,
    );
    suite.run({ rows: ['1', true] });
    // 'rows' is an ancestor of every union member path: coverage shares a
    // validation line without executing hidden predicates.
    const result = suite.changed('rows').run({ rows: ['2', false] });
    expect(result.hasErrors()).toBe(false);
  });

  it('[SC-EXCLUSION-OPAQUE] descendant focus below a union member stays precise', () => {
    const first = vi.fn(() => true);
    const second = vi.fn(() => true);
    const suite = create(
      data => {
        test('rows', () => true);
        void data;
      },
      enforce.shape({
        rows: enforce.isArrayOf(
          enforce.condition(first),
          enforce.condition(second),
        ),
      }) as never,
    );
    // Deeper than member rows.0 but sharing its validation line: the
    // member is covered without executing hidden predicates, while the
    // uncovered sibling still throws honestly. (Branch validation itself
    // may probe alternatives during any-match execution.)
    expect(() =>
      suite.changed('rows.0.deeper.still').run({ rows: [1, 2] }),
    ).toThrow(/mapping|union|focused/i);
    expect(second).not.toHaveBeenCalled();
  });

  it('[SC-MERGE] fallback-array members reuse retained output when identical', () => {
    const seen: unknown[] = [];
    const schema = compose(
      enforce.shape({
        rows: enforce.isArrayOf(enforce.condition(() => true)),
        note: enforce.isString(),
      }),
      enforce.condition(() => true),
    );
    const suite = create(data => {
      seen.push(data);
    }, schema as never);
    // Parser-free members leave no mapping provenance, so the unexecuted
    // member resolves identical to the raw input and reuses the retained
    // mapping instead of revalidating.
    suite.run({ rows: ['x', 'y'], note: 'first' });
    const result = suite
      .changed('rows.0')
      .run({ rows: ['z', 'y'], note: 'first' });
    expect(result.hasErrors()).toBe(false);
    expect(seen[1]).toEqual({ rows: ['z', 'y'], note: 'first' });
  });

  it('[SC-MERGE] skip-only runs ignore nested skips under scalars', () => {
    const seen: unknown[] = [];
    const suite = create(
      data => {
        seen.push(data);
        test('b', () => true);
      },
      enforce.shape({
        a: enforce.isString(),
        b: enforce.isString(),
      }) as never,
    );
    suite.run({ a: 'x', b: 'y' });
    const result = suite
      .focus({ skip: 'a.deeper.still' })
      .run({ a: 'x', b: 'z' });
    expect(result.hasErrors()).toBe(false);
    expect(seen[1]).toEqual({ a: 'x', b: 'z' });
  });

  it('[SC-MERGE] untouched absent keys hydrate from retention', () => {
    const seen: unknown[] = [];
    const schema = enforce.partial({
      gone: enforce.isString(),
      other: enforce.isString(),
    });
    const suite = create(data => {
      seen.push(data);
      test('other', () => true);
    }, schema as never);
    suite.run({ gone: 'g', other: 'ok' });
    // Unlike changing the deleted field itself (which honors deletion),
    // merely untouched absence hydrates from the retained mapping.
    const result = suite.changed('other').run({ other: 'next' });
    expect(result.hasErrors()).toBe(false);
    expect(seen[1]).toEqual({ other: 'next', gone: 'g' });
  });
});
