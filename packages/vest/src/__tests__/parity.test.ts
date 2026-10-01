import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { ParityScenario, parityScenarios } from './parity/parityScenarios';

/**
 * Behavior parity gate.
 *
 * Compares every scenario in parityScenarios.ts with parity.golden.json. A
 * failure means observable behavior changed. If the change is intended,
 * re-record with `VEST_PARITY_RECORD=1 yarn vitest run parity`, format the
 * golden with Prettier, and review its diff in the same PR.
 */
const GOLDEN = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'parity',
  'parity.golden.json',
);

const recording = process.env.VEST_PARITY_RECORD === '1';
const golden: Record<string, unknown> = recording
  ? {}
  : JSON.parse(readFileSync(GOLDEN, 'utf8'));

describe('behavior parity with the recorded baseline', () => {
  it('has a recording for every scenario', () => {
    if (recording) return;
    expect(Object.keys(golden).sort()).toEqual(
      parityScenarios.map(scenario => scenario.name).sort(),
    );
  });

  it.each(parityScenarios.map(scenario => [scenario.name, scenario] as const))(
    '%s',
    async (name: string, scenario: ParityScenario) => {
      const steps = await scenario.run();
      if (recording) {
        const current = existingGolden();
        current[name] = steps;
        writeFileSync(
          GOLDEN,
          `${JSON.stringify(sortKeys(current), null, 2)}\n`,
        );
        return;
      }
      expect(steps).toEqual(golden[name]);
    },
  );
});

function existingGolden(): Record<string, unknown> {
  try {
    return JSON.parse(readFileSync(GOLDEN, 'utf8'));
  } catch {
    return {};
  }
}

function sortKeys(record: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.keys(record)
      .sort()
      .map(key => [key, record[key]]),
  );
}
