import { describe, expect, it, vi } from 'vitest';

import { enforce } from '../n4s';
import { resolveAffectedPaths, runSchemaPaths } from '../schema/selectiveRun';

// FP01: freeze input and schema where supported, repeat equivalent runs,
// no writes into caller-owned objects; describe/planning invokes no
// getters or predicates (getter spies).
describe('schema contracts: frozen input and repeat stability (FP01)', () => {
  it('[SC-FP01] frozen input runs without writing into caller objects', () => {
    const predicate = vi.fn(() => true);
    const schema = enforce.shape({
      a: enforce.condition(predicate),
      b: enforce.isString(),
    });
    const input = Object.freeze({ a: 'x', b: 'ok' });
    const before = { ...input };

    const first = runSchemaPaths(schema, input, { affected: ['a'] });
    expect(first.some(result => !result.pass)).toBe(false);
    expect(predicate).toHaveBeenCalledTimes(1);
    // No writes into the caller-owned (frozen) object.
    expect(input).toEqual(before);
    expect(Object.isFrozen(input)).toBe(true);
  });

  it('[SC-FP01] repeat equivalent runs converge with a stable predicate census', () => {
    const predicate = vi.fn(() => true);
    const schema = enforce.shape({
      a: enforce.condition(predicate),
      b: enforce.isString().dependsOn($ => $.a),
    });
    const data = Object.freeze({ a: 'x', b: 'y' });

    const first = runSchemaPaths(schema, data, { affected: ['a'] });
    expect(predicate).toHaveBeenCalledTimes(1);
    predicate.mockClear();

    const second = runSchemaPaths(schema, data, { affected: ['a'] });
    expect(second).toEqual(first);
    expect(predicate).toHaveBeenCalledTimes(1);
  });

  it('[SC-FP01] describe and planning invoke no getters or predicates', () => {
    const predicate = vi.fn(() => true);
    const getter = vi.fn(() => 'x');
    const schema = enforce.shape({
      a: enforce.condition(predicate),
      b: enforce.isString().dependsOn($ => $.a),
    });
    const data = Object.defineProperty({ b: 'ok' }, 'a', {
      enumerable: true,
      get: getter,
    });

    const description = schema.describe();
    expect(description.relationships).toHaveLength(1);
    resolveAffectedPaths(schema, ['a'], data);

    expect(predicate).not.toHaveBeenCalled();
    expect(getter).not.toHaveBeenCalled();
  });

  it('[SC-FP01] planning over nested getter-backed objects reads zero accessors', () => {
    const predicate = vi.fn(() => true);
    const nestedGetter = vi.fn(() => ({ c: 'v' }));
    const schema = enforce.shape({
      nested: enforce.shape({
        c: enforce.condition(predicate),
      }),
    });
    const data: Record<string, unknown> = {};
    Object.defineProperty(data, 'nested', {
      enumerable: true,
      get: nestedGetter,
    });

    schema.describe();
    resolveAffectedPaths(schema, ['nested.c'], data);

    expect(predicate).not.toHaveBeenCalled();
    expect(nestedGetter).not.toHaveBeenCalled();
  });
});
