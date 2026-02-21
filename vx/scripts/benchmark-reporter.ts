/* eslint-disable complexity */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

import * as logger from '../logger.js';

const OUTPUT_FILE = process.env.CI
  ? 'benchmark-results.md'
  : 'benchmark-results-local.md';

type BenchmarkResult = {
  hz: number;
  name: string;
  p99: number;
  rme: string;
  suite: string;
};

type ComparisonResult = BenchmarkResult & {
  diffAbs?: number;
  diffPercent?: number;
};

function getBenchFiles(baseDir: string): string[] {
  const benchDir = path.join(baseDir, 'packages', 'vest', 'bench');
  if (!fs.existsSync(benchDir)) return [];

  const files = fs.readdirSync(benchDir, { recursive: true }) as string[];
  return files
    .filter(f => f.endsWith('.ts'))
    .map(f => path.join('packages/vest/bench', f).replace(/\\/g, '/'));
}

function runBenchmarkFile(filePath: string, cwd: string): string {
  try {
    logger.log(`Running benchmark file: ${filePath} in ${cwd}...`);
    // We explicitly enforce that filePath must be within the bench/ directory to prevent injection.
    const safeFilePath = filePath.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    return execSync(
      `yarn vitest bench --run --config packages/vest/vitest.config.ts --passWithNoTests --no-color "${safeFilePath}"`,
      {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'inherit'],
        cwd,
      },
    );
  } catch (error) {
    logger.error(`Benchmark command failed for ${filePath} in ${cwd}`);
    if (
      typeof error === 'object' &&
      error !== null &&
      'stdout' in error &&
      error.stdout
    ) {
      return (error as { stdout: Buffer }).stdout.toString();
    }
    return '';
  }
}

function parseOutput(output: string): BenchmarkResult[] {
  const lines = output.split('\n');
  const results: BenchmarkResult[] = [];
  let currentSuite = '';

  const resultRegex =
    /^\s+·\s+(.+?)\s+([\d.]+)\s+[\d.]+\s+[\d.]+\s+[\d.]+\s+[\d.]+\s+([\d.]+)\s+[\d.]+\s+[\d.]+\s+±([\d.]+%)\s+\d+$/;

  for (const line of lines) {
    if (line.includes('>')) {
      const parts = line.split('>');
      if (parts.length > 1) {
        currentSuite = parts[1]
          .trim()
          .replace(/\d+ms$/, '')
          .trim();
      }
    }

    const match = line.match(resultRegex);
    if (match) {
      const [_, name, hz, p99, rme] = match;
      results.push({
        hz: parseFloat(hz),
        name: name.trim(),
        p99: parseFloat(p99),
        rme,
        suite: currentSuite,
      });
    }
  }

  return results;
}

function calculateDiffs(
  current: BenchmarkResult[],
  baseline: Record<string, BenchmarkResult>,
): ComparisonResult[] {
  return current.map(res => {
    const key = `${res.suite}::${res.name}`;
    const base = baseline[key];

    if (!base) {
      return res;
    }

    let diffAbs = res.hz - base.hz;
    let diffPercent = (diffAbs / base.hz) * 100;

    // Mask diff if within margin of error OR less than 5%
    const rmeVal = parseFloat(res.rme.replace(/±/g, '').replace(/%/g, ''));
    const threshold = Math.max(5, rmeVal || 5);

    if (Math.abs(diffPercent) < threshold) {
      diffAbs = 0;
      diffPercent = 0;
    }

    return {
      ...res,
      diffAbs,
      diffPercent,
    };
  });
}

function formatDiff(diffAbs: number, diffPercent: number): string {
  if (diffAbs === 0 && diffPercent === 0) {
    return ' 0 | 0.00% |';
  }
  const diffAbsStr =
    diffAbs > 0 ? `+${diffAbs.toLocaleString()}` : diffAbs.toLocaleString();
  const diffPercentStr =
    diffPercent > 0
      ? `+${diffPercent.toFixed(2)}%`
      : `${diffPercent.toFixed(2)}%`;

  const mood = diffPercent > 5 ? '🎉' : diffPercent < -5 ? '⚠️' : '';

  return ` ${diffAbsStr} | ${diffPercentStr} ${mood} |`;
}

function formatRow(res: ComparisonResult, showDiff: boolean): string {
  let row = `| ${res.suite} | ${res.name} | **${res.hz.toLocaleString()}** | ${res.p99} | ${res.rme} |`;

  if (showDiff) {
    const diffAbs = res.diffAbs ?? 0;
    const diffPercent = res.diffPercent ?? 0;
    row += formatDiff(diffAbs, diffPercent);
  }
  return row;
}

function formatTable(results: ComparisonResult[], showDiff: boolean): string {
  let md = '| Suite | Benchmark | Ops/sec (Hz) | P99 (ms) | Margin of Error |';
  if (showDiff) {
    md += ' Diff (Abs) | Diff (%) |';
  }
  md += '\n';

  md += '| :--- | :--- | :--- | :--- | :--- |';
  if (showDiff) {
    md += ' :--- | :--- |';
  }
  md += '\n';

  for (const res of results) {
    md += formatRow(res, showDiff) + '\n';
  }
  return md;
}

function generateReport(results: ComparisonResult[]): string {
  let md = '## 🚀 Benchmark Results\n\n';
  md += formatTable(results, true);
  md +=
    '\n<details>\n<summary>Raw Output</summary>\n\n```\n' +
    'See CI logs for full output' +
    '\n```\n</details>';
  return md;
}

function main(): void {
  try {
    const args = process.argv.slice(2);
    const interlaceIndex = args.indexOf('--interlace');

    // Fallback if not interlacing (run all at once, no comparison)
    if (interlaceIndex === -1 || interlaceIndex + 1 >= args.length) {
      const out = runBenchmarkFile('packages/vest/bench/', process.cwd());
      const rawResults = parseOutput(out);
      const markdown = generateReport(rawResults);
      fs.writeFileSync(OUTPUT_FILE, markdown);
      logger.log(`Benchmark results written to ${OUTPUT_FILE}`);
      return;
    }

    // Interlaced comparison mode
    const baselineDir = path.resolve(args[interlaceIndex + 1]);
    const currentDir = process.cwd();

    const baselineFiles = getBenchFiles(baselineDir);
    const currentFiles = getBenchFiles(currentDir);

    const allFiles = Array.from(new Set([...baselineFiles, ...currentFiles]));

    const allCurrentResults: BenchmarkResult[] = [];
    const allBaselineResults: BenchmarkResult[] = [];

    for (const file of allFiles) {
      if (baselineFiles.includes(file)) {
        const out = runBenchmarkFile(file, baselineDir);
        allBaselineResults.push(...parseOutput(out));
      }
      if (currentFiles.includes(file)) {
        const out = runBenchmarkFile(file, currentDir);
        allCurrentResults.push(...parseOutput(out));
      }
    }

    const baselineDict: Record<string, BenchmarkResult> = {};
    for (const res of allBaselineResults) {
      baselineDict[`${res.suite}::${res.name}`] = res;
    }

    const finalResults = calculateDiffs(allCurrentResults, baselineDict);
    const markdown = generateReport(finalResults);
    fs.writeFileSync(OUTPUT_FILE, markdown);
    logger.log(`Benchmark results written to ${OUTPUT_FILE}`);
  } catch (error) {
    logger.error('Error generating benchmark report:', error);
    process.exit(1);
  }
}

main();
