import { describe, expect, it } from 'vitest';
import { enforce } from 'n4s';
import { resolveAffectedPaths } from 'n4s/exports/internal';

import { create, mode, Modes, test } from '../../vest';

const fields = ['a', 'b', 'c'] as const;
const edges = [
  ['a', 'b'],
  ['a', 'c'],
  ['b', 'a'],
  ['b', 'c'],
  ['c', 'a'],
  ['c', 'b'],
] as const;

/** Exhaust all 64 directed three-field graphs and all seven nonempty change sets.
 * The expected set is computed from the input edge list, never Vest's planner.
 */
describe('schema contracts: feature matrix', () => {
  it.each(Array.from({ length: 64 }, (_, mask) => mask))(
    '[SC-GRAPH] graph %i expands direct edges once and agrees with suite execution',
    mask => {
      const selectedEdges = edges.filter((_, index) => mask & (1 << index));
      const member = (name: string) => {
        const rule = enforce.isString();
        const sources = selectedEdges
          .filter(([, target]) => target === name)
          .map(([source]) => source);
        return sources.length
          ? rule.dependsOn(scope => sources.map(source => scope[source]))
          : rule;
      };
      const schema = enforce.shape({
        a: member('a'),
        b: member('b'),
        c: member('c'),
      });
      const description = JSON.stringify(schema.describe());
      for (let changedMask = 1; changedMask < 8; changedMask++) {
        const changed = fields.filter((_, index) => changedMask & (1 << index));
        const expected = new Set<string>(changed);
        for (const [source, target] of selectedEdges) {
          if (changed.includes(source)) expected.add(target);
        }
        const calls: string[] = [];
        const suite = create(() => {
          mode(Modes.ALL);
          for (const field of fields)
            test(field, () => {
              calls.push(field);
              return true;
            });
        }, schema);
        const data = Object.freeze({ a: 'a', b: 'b', c: 'c' });
        expect(resolveAffectedPaths(schema, changed, data).sort()).toEqual(
          [...expected].sort(),
        );
        const result = suite.changed(changed).run(data);
        expect(calls.sort()).toEqual([...expected].sort());
        expect(new Set(calls).size).toBe(calls.length);
        expect(result.hasErrors()).toBe(false);
        expect(JSON.stringify(schema.describe())).toBe(description);
      }
    },
  );

  it('[SC-GRAPH] duplicate changed names and duplicate sources do not duplicate execution', () => {
    const schema = enforce.shape({
      a: enforce.isString(),
      b: enforce.isString().dependsOn($ => [$.a, $.a]),
    });
    const calls: string[] = [];
    const suite = create(() => {
      test('a', () => {
        calls.push('a');
      });
      test('b', () => {
        calls.push('b');
      });
    }, schema);
    suite.changed(['a', 'a']).run({ a: 'ok', b: 'ok' });
    expect(calls).toEqual(['a', 'b']);
  });

  it('[SC-GRAPH] describe returns detached serializable metadata', () => {
    const schema = enforce.shape({
      a: enforce.isString(),
      b: enforce.isString().dependsOn($ => $.a),
    });
    const first = schema.describe();
    const expected = JSON.stringify(first);
    first.relationships.length = 0;
    first.dependencies.length = 0;
    expect(JSON.stringify(schema.describe())).toBe(expected);
    expect(JSON.parse(expected).relationships).toHaveLength(1);
  });
});
