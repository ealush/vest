/**
 * Targeted mutation checks for the highest-risk schema-relationship rules
 * (production acceptance plan: MUT).
 *
 * For each mutant the script temporarily patches one production file, runs
 * the listed contract test files, and requires them to FAIL (the mutant is
 * "killed": the contracts detect the seeded defect). The file is always
 * restored, even when the run crashes. Mutated production code is never
 * committed. Exit nonzero if any mutant survives or restoration fails.
 */
/* eslint-disable no-console */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..');
const VITEST_BIN = path.join(REPO_ROOT, 'node_modules', '.bin', 'vitest');

const MUTANTS = [
  {
    edits: [
      {
        file: 'packages/n4s/src/schema/selectiveRun.ts',
        newText: '  return [...affected];',
        oldText: '  return affected.filter(field => !skipped.has(field));',
      },
      {
        file: 'packages/n4s/src/schema/selectiveRun.ts',
        newText: '    ...new Set(expanded),',
        oldText:
          '    ...new Set(expanded.filter(field => !isSkipCovered(field, skipSegs))),',
      },
    ],
    id: 'M1-skip-filter',
    reason: 'Removing both skip-subtraction layers must re-run skipped fields.',
    tests: [
      'packages/vest/src/suite/__tests__/schemaContracts.exclusions.test.ts',
    ],
  },
  {
    edits: [
      {
        file: 'packages/n4s/src/schema/selectiveRun.ts',
        newText: `  const base =
    relationships.length === 0
      ? [...new Set(changedArray)]
      : collectForwardTargets(
          collectForwardTargets(changedArray, relationships, data),
          relationships,
          data,
        );`,
        oldText: `  const base =
    relationships.length === 0
      ? [...new Set(changedArray)]
      : collectForwardTargets(changedArray, relationships, data);`,
      },
    ],
    id: 'M2-transitive-expansion',
    reason: 'Two-hop expansion must execute non-direct dependents.',
    tests: [
      'packages/n4s/src/schema/__tests__/schemaContracts.readiness.test.ts',
    ],
  },
  {
    edits: [
      {
        file: 'packages/vest/src/suite/useCreateSuiteRunner.ts',
        newText: '  if (previous !== undefined && false) {',
        oldText: '  if (previous !== undefined) {',
      },
    ],
    id: 'M3-stale-generation',
    reason: 'Unchained superseded runs must hang or misreport.',
    tests: ['packages/vest/src/suite/__tests__/schemaContracts.async.test.ts'],
  },
  {
    edits: [
      {
        file: 'packages/vest/src/suite/schemaOutput.ts',
        newText: '  return results[0].type !== undefined ? results[0] : null;',
        oldText:
          "  return hasOwnProperty(results[0], 'type') ? results[0] : null;",
      },
    ],
    id: 'M4-missing-undefined-collapse',
    reason: 'Present-undefined outputs must not collapse to empty mapping.',
    tests: ['packages/vest/src/suite/__tests__/schemaContracts.output.test.ts'],
  },
  {
    edits: [
      {
        file: 'packages/vest/src/suite/cloneDataTree.ts',
        newText: '    const copy = data;',
        oldText: '    const copy = data.slice(0);',
      },
    ],
    id: 'M5-buffer-reuse',
    reason: 'Aliased backing buffers must leak mutations.',
    tests: [
      'packages/vest/src/suite/__tests__/schemaContracts.snapshots.test.ts',
    ],
  },
  {
    edits: [
      {
        file: 'packages/n4s/src/schema/selectiveRun.ts',
        newText: `  if (!projectedSchema) {
    return { results: [{ pass: true, type: data }] };
  }`,
        oldText: `  if (!projectedSchema) {
    throw new SchemaExclusionError(
      'The schema cannot execute this selection without running excluded rules. Select the containing field or run the full schema.',
    );
  }`,
      },
    ],
    id: 'M6-unprojectable-silent-pass',
    reason: 'An unprojectable selection must reject, never pass unvalidated.',
    tests: [
      'packages/n4s/src/schema/__tests__/selectiveRun.coverage.test.ts',
      'packages/vest/src/suite/__tests__/changed.integration.test.ts',
    ],
  },
];

function countOccurrences(source, text) {
  return source.split(text).length - 1;
}

function packageOf(testFile) {
  if (testFile.includes('packages/n4s/')) return 'packages/n4s';
  return 'packages/vest';
}

function groupByPackage(files) {
  const byPackage = new Map();
  for (const file of files) {
    const pkg = packageOf(file);
    if (!byPackage.has(pkg)) byPackage.set(pkg, []);
    byPackage.get(pkg).push(path.relative(path.join(REPO_ROOT, pkg), file));
  }
  return byPackage;
}

/**
 * Returns 'passed', 'failed', or 'inconclusive'. Only a structured Vitest
 * report with failed test cases proves a killed mutant; loader, config, and
 * collection failures are inconclusive, never a kill.
 */
function runTests(files) {
  const report = path.join(os.tmpdir(), `vest-mutant-${process.pid}.json`);
  const counts = { failed: 0, total: 0 };
  try {
    for (const [pkg, relativeFiles] of groupByPackage(files)) {
      const outcome = runPackageTests(pkg, relativeFiles, report);
      if (outcome === null) return 'inconclusive';
      counts.total += outcome.total;
      counts.failed += outcome.failed;
    }
    return summarizeCounts(counts);
  } finally {
    fs.rmSync(report, { force: true });
  }
}

function summarizeCounts({ failed, total }) {
  if (total === 0) return 'inconclusive';
  return failed > 0 ? 'failed' : 'passed';
}

function runPackageTests(pkg, relativeFiles, report) {
  const exitCode = execVitest(pkg, relativeFiles, report);
  const counts = readReport(report);
  if (counts === null) return null;
  // A non-zero exit without failed cases is an infrastructure failure.
  return exitCode !== 0 && counts.failed === 0 ? null : counts;
}

function readReport(report) {
  if (!fs.existsSync(report)) return null;
  const result = JSON.parse(fs.readFileSync(report, 'utf8'));
  fs.rmSync(report, { force: true });
  const total = result.numTotalTests;
  if (!Number.isInteger(total) || total < 1) return null;
  return { failed: result.numFailedTests ?? 0, total };
}

function execVitest(pkg, relativeFiles, report) {
  try {
    execFileSync(
      VITEST_BIN,
      [
        'run',
        '--config',
        path.join(REPO_ROOT, pkg, 'vitest.config.ts'),
        '--reporter=json',
        `--outputFile=${report}`,
        ...relativeFiles,
      ],
      { cwd: path.join(REPO_ROOT, pkg), stdio: 'pipe' },
    );
    return 0;
  } catch (error) {
    process.stderr.write(error.stdout ?? '');
    process.stderr.write(error.stderr ?? '');
    return error.status ?? 1;
  }
}

const OUTCOME_LABELS = {
  failed: 'killed',
  inconclusive: 'inconclusive (test infrastructure failed)',
  passed: 'SURVIVED (tests still green)',
};

function checkMutant(mutant) {
  if (runTests(mutant.tests) !== 'passed') {
    return { id: mutant.id, ok: false, result: 'baseline did not pass' };
  }
  const originals = new Map();
  const saveOriginal = edit => {
    if (!originals.has(edit.file)) {
      originals.set(
        edit.file,
        fs.readFileSync(path.join(REPO_ROOT, edit.file), 'utf8'),
      );
    }
    return originals.get(edit.file);
  };
  const restoreAll = () => {
    for (const [file, original] of originals) {
      fs.writeFileSync(path.join(REPO_ROOT, file), original);
    }
  };
  try {
    for (const edit of mutant.edits) {
      const filePath = path.join(REPO_ROOT, edit.file);
      const current = fs.readFileSync(filePath, 'utf8');
      if (countOccurrences(current, edit.oldText) !== 1) {
        return {
          id: mutant.id,
          ok: false,
          result: `anchor not unique in ${edit.file}, skipped`,
        };
      }
      saveOriginal(edit);
      fs.writeFileSync(filePath, current.replace(edit.oldText, edit.newText));
    }
    const outcome = runTests(mutant.tests);
    return {
      id: mutant.id,
      ok: outcome === 'failed',
      result: OUTCOME_LABELS[outcome],
    };
  } finally {
    restoreAll();
  }
}

function main() {
  const results = MUTANTS.map(checkMutant);
  for (const { id, result } of results) {
    console.log(`mutant ${id}: ${result}`);
  }
  assertRestored();
  assertAllKilled(results);
  console.log('mutation checks passed: all 6 mutants killed');
}

function assertRestored() {
  const dirty = [];
  for (const mutant of MUTANTS) {
    for (const edit of mutant.edits) {
      const current = fs.readFileSync(path.join(REPO_ROOT, edit.file), 'utf8');
      if (!current.includes(edit.oldText)) dirty.push(edit.file);
    }
  }
  if (dirty.length > 0) {
    throw new Error(
      `mutated production code left behind in: ${[...new Set(dirty)].join(', ')}`,
    );
  }
}

function assertAllKilled(results) {
  const survivors = results.filter(r => !r.ok);
  if (survivors.length > 0) {
    throw new Error(
      `mutation check failed: ${survivors.map(s => `${s.id} (${s.result})`).join(', ')}`,
    );
  }
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.stack ?? error}\n`);
  process.exitCode = 1;
}
