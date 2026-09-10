import { describe, expect, it, vi } from 'vitest';

import { compose, enforce } from '../../n4s';
import { runSchemaPaths } from '../selectiveRun';

const fields = ['a', 'b', 'c'] as const;
const edges = [
  ['a', 'b'],
  ['a', 'c'],
  ['b', 'a'],
  ['b', 'c'],
  ['c', 'a'],
  ['c', 'b'],
] as const;

describe('schema contracts: release-readiness execution audit', () => {
  // Independent oracle: compute direct adjacency from the fixture, never
  // resolveAffectedPaths. Check real predicates, not just selected user tests.
  it.each(Array.from({ length: 64 }, (_, mask) => mask))(
    '[SC-EXECUTION-MATRIX] graph %i validates exactly the direct set, including failures',
    graphMask => {
      const graph = edges.filter((_, index) => graphMask & (1 << index));
      for (let changeMask = 1; changeMask < 8; changeMask += 1) {
        const changed = fields.filter((_, index) => changeMask & (1 << index));
        const expected = new Set<string>(changed);
        for (const [source, target] of graph) {
          if (changed.includes(source)) expected.add(target);
        }
        for (const invalid of [null, ...fields]) {
          const calls: string[] = [];
          const member = (field: string) => {
            const rule = enforce.condition(() => {
              calls.push(field);
              return field !== invalid;
            });
            const sources = graph
              .filter(([, target]) => target === field)
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
          const result = runSchemaPaths(
            schema,
            { a: 'a', b: 'b', c: 'c' },
            { affected: changed },
          );
          expect(calls.sort()).toEqual([...expected].sort());
          const failed = result
            .filter(entry => !entry.pass)
            .map(entry => entry.path?.join('.'));
          expect(failed).toEqual(
            invalid !== null && expected.has(invalid) ? [invalid] : [],
          );
        }
      }
    },
  );

  it.each(['source', 'target'] as const)(
    '[SC-EXECUTION-ROOTED] editing %s does not execute unrelated local or root providers',
    changed => {
      const calls: string[] = [];
      const count = (name: string) =>
        enforce.condition(() => {
          calls.push(name);
          return true;
        });
      const schema = enforce.shape({
        policy: count('policy'),
        company: enforce.shape({
          source: count('company.source'),
          target: count('company.target').dependsOn($ => [
            $.source,
            $.root.policy,
          ]),
        }),
        unrelated: count('unrelated'),
      });
      runSchemaPaths(
        schema,
        {
          policy: 'ok',
          company: { source: 'ok', target: 'ok' },
          unrelated: 'ok',
        },
        { affected: [`company.${changed}`] },
      );
      expect(calls.sort()).toEqual(
        changed === 'source'
          ? ['company.source', 'company.target']
          : ['company.target'],
      );
    },
  );

  it.each(['passing', 'failing'] as const)(
    '[SC-SKIP-FALLBACK] root-chain fallback never executes an explicitly skipped predicate (%s)',
    verdict => {
      const skipped = vi.fn(() => verdict === 'passing');
      const selected = vi.fn(() => true);
      const schema = compose(
        enforce.shape({
          a: enforce.condition(skipped),
          b: enforce.condition(selected),
        }),
        enforce.condition(() => true),
      );
      const result = runSchemaPaths(
        schema,
        { a: 'a', b: 'b' },
        { affected: ['b'], skip: ['a'] },
      );
      expect(skipped).not.toHaveBeenCalled();
      expect(selected).toHaveBeenCalledTimes(1);
      expect(result.every(entry => entry.pass)).toBe(true);
    },
  );
});
