import { execSync } from 'child_process';
import fs from 'fs';

import * as logger from '../logger.js';

const OUTPUT_FILE = 'benchmark-results.md';

type BenchmarkResult = {
  hz: number;
  name: string;
  p99: number;
  rme: string;
  suite: string;
};

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

function generateMarkdown(results: BenchmarkResult[]): string {
  if (results.length === 0) {
    return 'No benchmark results found.';
  }

  let md = '## 🚀 Benchmark Results\n\n';
  md += '| Suite | Benchmark | Ops/sec (Hz) | P99 (ms) | Margin of Error |\n';
  md += '| :--- | :--- | :--- | :--- | :--- |\n';

  for (const res of results) {
    md += `| ${res.suite} | ${res.name} | **${res.hz.toLocaleString()}** | ${res.p99} | ${res.rme} |\n`;
  }

  md +=
    '\n<details>\n<summary>Raw Output</summary>\n\n```\n' +
    'See CI logs for full output' +
    '\n```\n</details>';
  return md;
}

function main(): void {
  try {
    const output = runBenchmarks();
    const results = parseOutput(output);
    const markdown = generateMarkdown(results);

    fs.writeFileSync(OUTPUT_FILE, markdown);
    logger.log(`Benchmark results written to ${OUTPUT_FILE}`);

    // Also print to console for debugging
    logger.log(markdown);
  } catch (error) {
    logger.error('Error generating benchmark report:', error);
    process.exit(1);
  }
}

main();
