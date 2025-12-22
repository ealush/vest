import { execSync } from 'child_process';
import fs from 'fs';

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
  diffAbs?: number; // Difference in Hz
  diffPercent?: number;
};

// eslint-disable-next-line complexity
function runBenchmarks(): string {
  try {
    logger.log('Running benchmarks...');
    const output = execSync(
      'yarn vitest bench --run --config packages/vest/vitest.config.ts --passWithNoTests --no-color packages/vest/bench/',
      {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'inherit'], // Capture stdout, let stderr go to console
        cwd: process.cwd(),
      },
    );
    return output;
  } catch (error) {
    logger.error('Benchmark command failed or found no tests.');
    if (
      typeof error === 'object' &&
      error !== null &&
      'stdout' in error &&
      error.stdout
    ) {
      return (error as { stdout: Buffer }).stdout.toString();
    }
    throw error;
  }
}

function parseOutput(output: string): BenchmarkResult[] {
  const lines = output.split('\n');
  const results: BenchmarkResult[] = [];
  let currentSuite = '';

  // Regex to match result lines:
  //    · full run with feature flags  415.54  1.9833   9.4383  2.4065  2.5399  3.5622  3.6703   9.4383  ±2.07%      416
  // We look for lines starting with "   · "
  const resultRegex =
    /^\s+·\s+(.+?)\s+([\d.]+)\s+[\d.]+\s+[\d.]+\s+[\d.]+\s+[\d.]+\s+([\d.]+)\s+[\d.]+\s+[\d.]+\s+±([\d.]+%)\s+\d+$/;

  for (const line of lines) {
    // Check for suite name (e.g. " ✓ bench/complex-flows.bench.ts > Complex Feature Mix")
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

function parseTableRow(row: string): BenchmarkResult | null {
  const cols = row
    .split('|')
    .map(c => c.trim())
    .filter(c => c.length > 0);

  if (cols.length < 5) return null;

  const [suite, name, hzStr, p99Str, rme] = cols;

  return {
    hz: parseFloat(hzStr.replace(/\*\*/g, '').replace(/,/g, '')),
    name,
    p99: parseFloat(p99Str),
    rme,
    suite,
  };
}

function parseBaselineContent(
  content: string,
): Record<string, BenchmarkResult> | null {
  const tableStart = content.indexOf('| Suite |');
  if (tableStart === -1) {
    return null;
  }

  const rows = content.slice(tableStart).split('\n');
  const baseline: Record<string, BenchmarkResult> = {};

  for (let i = 2; i < rows.length; i++) {
    const row = rows[i].trim();
    if (!row.startsWith('|')) {
      break;
    }

    const result = parseTableRow(row);
    if (result) {
      baseline[`${result.suite}::${result.name}`] = result;
    }
  }

  return baseline;
}

function getLatestBaseline(
  filePath: string,
): Record<string, BenchmarkResult> | null {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  return parseBaselineContent(content);
}

function calculateDiffs(
  current: BenchmarkResult[],
  baseline: Record<string, BenchmarkResult> | null,
): ComparisonResult[] {
  return current.map(res => {
    const key = `${res.suite}::${res.name}`;
    const base = baseline?.[key];

    if (!base) {
      return res;
    }

    const diffAbs = res.hz - base.hz;
    const diffPercent = (diffAbs / base.hz) * 100;

    return {
      ...res,
      diffAbs,
      diffPercent,
    };
  });
}

function getGitInfo() {
  try {
    const hash = execSync('git rev-parse --short HEAD', {
      encoding: 'utf8',
    }).trim();
    const date = execSync('git log -1 --format=%cd --date=short', {
      encoding: 'utf8',
    }).trim();
    const title = execSync('git log -1 --format=%s', {
      encoding: 'utf8',
    }).trim();
    return { hash, date, title };
  } catch (e) {
    return { hash: 'unknown', date: 'unknown', title: 'unknown' };
  }
}

function formatDiff(diffAbs: number, diffPercent: number): string {
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

function generateReport(
  results: ComparisonResult[],
  updateMode: boolean,
): string {
  if (updateMode) {
    const { hash, date, title } = getGitInfo();
    let content = `### ${hash} - ${date}\n`;
    content += `> ${title}\n\n`;
    content += formatTable(results, false);
    content += '\n---\n\n';

    let existingInfo = '';
    if (fs.existsSync(OUTPUT_FILE)) {
      existingInfo = fs.readFileSync(OUTPUT_FILE, 'utf8');
      const lines = existingInfo.split('\n');
      if (lines[0].startsWith('## 🚀 Benchmark Results')) {
        existingInfo = lines.slice(1).join('\n').trim();
      }
    }

    return `## 🚀 Benchmark Results\n\n${content}${existingInfo}`;
  }

  // PR Mode
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
    const updateMode = args.includes('--update');

    const output = runBenchmarks();
    const rawResults = parseOutput(output);

    let finalResults: ComparisonResult[] = rawResults;

    if (!updateMode) {
      const baseline = getLatestBaseline(OUTPUT_FILE);
      finalResults = calculateDiffs(rawResults, baseline);
    }

    const markdown = generateReport(finalResults, updateMode);

    fs.writeFileSync(OUTPUT_FILE, markdown);
    logger.log(`Benchmark results written to ${OUTPUT_FILE}`);
    // logger.log(markdown);
  } catch (error) {
    logger.error('Error generating benchmark report:', error);
    process.exit(1);
  }
}

main();
