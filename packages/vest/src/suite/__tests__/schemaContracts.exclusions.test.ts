import { describe, expect, it, vi } from 'vitest';

import { FocusedSchemaMappingError, SchemaExclusionError, compose } from 'n4s';

import { create, enforce, mode, Modes, test } from '../../vest';

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
