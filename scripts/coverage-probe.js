/** Probe: list uncovered branch lines per module (one coverage run). */
/* eslint-disable no-console */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..');
const VITEST_BIN = path.join(REPO_ROOT, 'node_modules', '.bin', 'vitest');
const REPORT_DIR = path.join(REPO_ROOT, '.coverage-probe');
const TARGETS =
  process.argv[2] === 'vest' ? ['packages/vest'] : ['packages/n4s'];

fs.rmSync(REPORT_DIR, { force: true, recursive: true });
for (const pkg of TARGETS) {
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
    { cwd: path.join(REPO_ROOT, pkg), stdio: 'ignore' },
  );
}
const raw = JSON.parse(
  fs.readFileSync(
    path.join(REPORT_DIR, TARGETS[0], 'coverage-final.json'),
    'utf8',
  ),
);
const want = process.argv[3] ? [process.argv[3]] : null;
for (const [filePath, entry] of Object.entries(raw)) {
  const rel = path.relative(REPO_ROOT, filePath);
  if (want && !want.some(w => rel.endsWith(w))) continue;
  if (
    !/(selectiveRun|dependencyResolver|useCreateSuiteRunner|cloneDataTree)\.ts$/.test(
      rel,
    )
  )
    continue;
  const lines = new Set();
  for (const [id, map] of Object.entries(entry.branchMap ?? {})) {
    (map.locations ?? []).forEach((loc, i) => {
      if (((entry.b ?? {})[id] ?? [])[i] === 0) lines.add(loc.start.line);
    });
  }
  console.log(`=== ${rel} (${lines.size} uncovered branch lines) ===`);
  console.log(
    [...lines]
      .sort((a, b) => a - b)
      .slice(0, 60)
      .join(','),
  );
}
fs.rmSync(REPORT_DIR, { force: true, recursive: true });
