import { describe, expect, it } from 'vitest';
import { enforce } from 'n4s';
import { resolveAffectedPaths } from 'n4s/exports/internal';

import { create } from '../../vest';

// FP02b (Vest half): the outer run materializes allowed getters at its
// documented data boundary. Planning (describe + resolveAffectedPaths)
// reads zero accessors (pinned on the n4s side); the suite run may read
// the selected getter once per published copy.
describe('schema contracts: outer-run materialization (FP02b)', () => {
  it('[SC-FP02b] the outer run materializes the selected getter at the documented boundary', () => {
    const reads: string[] = [];
    const schema = enforce.shape({
      a: enforce.isString(),
      nested: enforce.shape({ c: enforce.isString() }),
    });
    const nested: Record<string, unknown> = {};
    Object.defineProperty(nested, 'c', {
      enumerable: true,
      get: () => {
        reads.push('nested.c');
        return 'v';
      },
    });
    const data: Record<string, unknown> = {};
    Object.defineProperty(data, 'a', {
      enumerable: true,
      get: () => {
        reads.push('a');
        return 'x';
      },
    });
    Object.defineProperty(data, 'nested', {
      enumerable: true,
      value: nested,
    });

    resolveAffectedPaths(schema, ['a'], data);
    expect(reads).toEqual([]);

    const seen: unknown[] = [];
    const suite = create((input: unknown) => {
      seen.push(input);
    }, schema);
    const result = suite.changed('a').run(data as never);
    expect(result.hasErrors()).toBe(false);
    expect(reads.length).toBeGreaterThan(0);
    expect(reads).toContain('a');
    expect(seen).toHaveLength(1);
  });
});
