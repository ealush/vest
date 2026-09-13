/**
 * gate:schema-coverage — branch-coverage floor gate for the schema-relationship
 * runtime modules (production acceptance plan: COV).
 *
 * Runs the vest and n4s package suites under V8 coverage using each
 * package's own vitest config (whose aliases resolve workspace sources, so
 * measured files are the real modules — never built dist output), merges
 * the reports, and enforces per-module branch floors. Untested production
 * files count via coverage `all` semantics; a missing module row fails
 * closed. Exit nonzero on any violation.
 */
/* eslint-disable no-console */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..');
const VITEST_BIN = path.join(REPO_ROOT, 'node_modules', '.bin', 'vitest');
const REPORT_DIR = path.join(REPO_ROOT, '.coverage-schema-gate');

// Module suffix (repo-relative) -> required branch percent. Floors are
// acceptance targets from the production acceptance plan.
const FLOORS = new Map([
  ['packages/n4s/src/schema/selectiveRun.ts', 85],
  ['packages/n4s/src/schema/dependencyResolver.ts', 85],
  ['packages/vest/src/suite/useCreateSuiteRunner.ts', 90],
  ['packages/vest/src/suite/cloneDataTree.ts', 95],
]);

const PACKAGES = ['packages/vest', 'packages/n4s'];

function branchPercent(entry) {
  const [taken, total] = countBranches(entry.branchMap ?? {}, entry.b ?? {});
  return total === 0 ? 100 : (taken / total) * 100;
}

function countBranches(branchMap, counts) {
  let total = 0;
  let taken = 0;
  for (const id of Object.keys(branchMap)) {
    const [hit, all] = countBranch(branchMap[id], counts[id] ?? []);
    taken += hit;
    total += all;
  }
  return [taken, total];
}

function countBranch(map, hits) {
  const locations = map.locations ?? [];
  let taken = 0;
  for (let index = 0; index < locations.length; index += 1) {
    if ((hits[index] ?? 0) > 0) taken += 1;
  }
  return [taken, locations.length];
}

function runPackageCoverage(pkg) {
  execFileSync(
    VITEST_BIN,
    [
      'run',
      '--config',
      path.join(REPO_ROOT, pkg, 'vitest.config.ts'),
      '--coverage.enabled',
      '--coverage.provider=v8',
      '--coverage.reporter=json',
      `--coverage.reportsDirectory=${path.join(REPORT_DIR, pkg)}`,
      '--coverage.all=true',
    ],
    { cwd: path.join(REPO_ROOT, pkg), stdio: 'inherit' },
  );
}

function main() {
  fs.rmSync(REPORT_DIR, { force: true, recursive: true });
  for (const pkg of PACKAGES) runPackageCoverage(pkg);
  const byFile = mergeReports();
  const failed = evaluateFloors(byFile);
  fs.rmSync(REPORT_DIR, { force: true, recursive: true });
  if (failed) {
    throw new Error('gate:schema-coverage failed');
  }
  console.log('gate:schema-coverage passed');
}

function mergeReports() {
  const byFile = new Map();
  for (const pkg of PACKAGES) {
    const finalPath = path.join(REPORT_DIR, pkg, 'coverage-final.json');
    if (!fs.existsSync(finalPath)) {
      throw new Error(`coverage report missing at ${finalPath}`);
    }
    const raw = JSON.parse(fs.readFileSync(finalPath, 'utf8'));
    for (const [filePath, entry] of Object.entries(raw)) {
      byFile.set(path.relative(REPO_ROOT, filePath), branchPercent(entry));
    }
  }
  return byFile;
}

function evaluateFloors(byFile) {
  let failed = false;
  console.log('module | branch % | floor % | verdict');
  for (const [suffix, floor] of FLOORS) {
    const observed = byFile.get(suffix);
    if (observed === undefined) {
      failed = true;
      console.log(`${suffix} | missing | ${floor} | FAIL (no row)`);
      continue;
    }
    const ok = observed >= floor;
    if (!ok) failed = true;
    console.log(
      `${suffix} | ${observed.toFixed(2)} | ${floor} | ${ok ? 'pass' : 'FAIL'}`,
    );
  }
  return failed;
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.stack ?? error}\n`);
  process.exitCode = 1;
}
