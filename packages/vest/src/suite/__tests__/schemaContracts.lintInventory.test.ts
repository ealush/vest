import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

// Repo root anchored: vitest may run with the package directory as cwd
// (e.g. coverage gates), so never rely on process.cwd() for file paths.
const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
  '..',
  '..',
);

// DD08: lint inventory for modified critical code. Pins the reviewed
// eslint state for the three schema-relationships critical files so no
// new warning lands unexplained: 0 errors, no new warnings versus the
// inventoried count, and every warning belongs to the known max-*
// complexity/size family (no blanket disables, no new rule families
// without an explicit inventory update).
const FILES = [
  'packages/n4s/src/schema/selectiveRun.ts',
  'packages/vest/src/suite/useCreateSuiteRunner.ts',
  'scripts/gate-schema-performance.js',
];

// Inventoried 2026-09-15: 22 warnings, 0 errors.
// selectiveRun.ts: 9 (max-statements/max-params), useCreateSuiteRunner.ts:
// 12 (max-lines-per-function/max-statements/max-params; +2 for the
// skip-all witness-preservation branch and line growth in the runner),
// gate script: 1 (max-params). All are size/complexity budgets, none
// suppress behavior rules, and none use blanket `eslint-disable` (only
// targeted `eslint-disable-next-line complexity` with justification
// comments).
const INVENTORIED_WARNINGS = 22;
const ALLOWED_RULES = new Set([
  'max-statements',
  'max-params',
  'max-lines-per-function',
  'complexity',
]);

type EslintMessage = { ruleId: string | null; severity: 1 | 2 };
type EslintResult = {
  errorCount: number;
  warningCount: number;
  messages: EslintMessage[];
  filePath: string;
};

function lintCriticalFiles(): EslintResult[] {
  const raw = execFileSync('npx', ['eslint', ...FILES, '--format', 'json'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
  return JSON.parse(raw) as EslintResult[];
}

describe('schema contracts: critical-file lint inventory (DD08)', () => {
  it('[SC-DD08] critical files report zero errors, no new warnings, and only explained budgets', () => {
    const results = lintCriticalFiles();
    expect(results).toHaveLength(FILES.length);
    const errors = results.reduce((sum, r) => sum + r.errorCount, 0);
    const warnings = results.reduce((sum, r) => sum + r.warningCount, 0);
    expect(errors).toBe(0);
    // No NEW warnings versus the inventoried head: fewer is fine (cleanup),
    // more fails until the inventory above is explicitly updated.
    expect(warnings).toBeLessThanOrEqual(INVENTORIED_WARNINGS);
    for (const result of results) {
      for (const message of result.messages) {
        expect(message.severity).toBe(1);
        expect(typeof message.ruleId).toBe('string');
        expect(ALLOWED_RULES.has(message.ruleId as string)).toBe(true);
      }
    }
  }, 60000);
});
