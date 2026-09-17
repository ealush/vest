import { describe, expect, it, vi } from 'vitest';

import { enforce } from '../n4s';
import { resolveAffectedPaths } from '../schema/selectiveRun';

// FP02b (n4s half): planning-vs-materialization census. describe() +
// selection planning read zero input accessors. The outer-run
// materialization half lives in the Vest suite contract
// (schemaContracts.materialization.test.ts) to preserve the n4s/Vest
// domain split (no upward imports from n4s into Vest).
describe('schema contracts: planning versus materialization (FP02b)', () => {
  it('[SC-FP02b] describe and selection planning read zero input accessors', () => {
    const predicate = vi.fn(() => true);
    const rootGetter = vi.fn(() => 'x');
    const nestedGetter = vi.fn(() => 'y');
    const schema = enforce.shape({
      a: enforce.condition(predicate),
      nested: enforce.shape({
        c: enforce.isString(),
      }),
    });
    const nested: Record<string, unknown> = {};
    Object.defineProperty(nested, 'c', {
      enumerable: true,
      get: nestedGetter,
    });
    const data: Record<string, unknown> = { b: 'ok' };
    Object.defineProperty(data, 'a', {
      enumerable: true,
      get: rootGetter,
    });
    Object.defineProperty(data, 'nested', {
      enumerable: true,
      value: nested,
    });

    schema.describe();
    resolveAffectedPaths(schema, ['a'], data);
    resolveAffectedPaths(schema, ['nested.c'], data);

    expect(predicate).not.toHaveBeenCalled();
    expect(rootGetter).not.toHaveBeenCalled();
    expect(nestedGetter).not.toHaveBeenCalled();
  });
});
