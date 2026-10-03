#!/usr/bin/env node
/* eslint-disable no-console -- This command reports bundle sizes to its caller. */
/**
 * Bundle-size gate for Vest consumers.
 *
 * Bundles small consumer entries from source (tsconfig paths resolve the
 * workspace packages), minifies them and compares their gzip size to
 * scripts/bundle-size.baseline.json. A consumer that does not use a feature
 * must not pay for it: each entry may grow by at most TOLERANCE_BYTES.
 *
 *   node scripts/check-bundle-size.mjs            check against the baseline
 *   node scripts/check-bundle-size.mjs --update   re-record the baseline
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

import { build } from 'esbuild';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE = path.join(ROOT, 'scripts', 'bundle-size.baseline.json');
const TOLERANCE_BYTES = 512;

const ENTRIES = {
  'minimal suite (create, test, enforce)': `
    import { create, test, enforce } from 'vest';
    const suite = create(data => {
      test('username', 'Required', () => {
        enforce(data.username).isNotBlank();
      });
    });
    globalThis.result = suite.run({ username: '' });
  `,
  'schema suite (create, test, enforce.shape)': `
    import { create, test, enforce } from 'vest';
    const suite = create(data => {
      test('username', 'Required', () => {
        enforce(data.username).isNotBlank();
      });
    }, enforce.shape({ username: enforce.isString() }));
    globalThis.result = suite.run({ username: '' });
  `,
  'n4s only (enforce)': `
    import { enforce } from 'n4s';
    globalThis.result = enforce.isString().test('x');
  `,
  'relationships suite (vest/relationships)': `
    import 'vest/relationships';
    import { create, enforce, test } from 'vest';
    const schema = enforce.shape({
      password: enforce.isString(),
      confirm: enforce.isString().dependsOn($ => $.password),
    });
    const suite = create(data => {
      test('confirm', () => enforce(data.confirm).isString());
    }, schema);
    globalThis.result = suite.changed('password').run({ password: 'a', confirm: 'a' });
  `,
};

/**
 * Resolves workspace packages to their source entries, following the
 * `paths` map in tsconfig.json, so the measurement does not depend on a
 * prior build or on how node_modules is linked.
 */
function workspaceSourcePlugin() {
  const tsconfig = JSON.parse(
    readFileSync(path.join(ROOT, 'tsconfig.json'), 'utf8'),
  );
  const paths = tsconfig.compilerOptions.paths;
  const packages = Object.keys(paths).filter(key => !key.endsWith('/*'));
  const filter = new RegExp(`^(${packages.join('|')})(/.*)?$`);
  return {
    name: 'workspace-source',
    setup(pluginBuild) {
      pluginBuild.onResolve({ filter }, args => {
        const [, name, subpath = ''] = args.path.match(filter);
        const sourceDir = path.join(ROOT, paths[name][0]);
        const entry = subpath
          ? subpathEntry(sourceDir, subpath.slice(1))
          : path.join(sourceDir, `${name}.ts`);
        return { path: entry };
      });
    },
  };
}

// `pkg/x` maps to src/x.ts (tsconfig `pkg/*`) or to the published
// subpath export src/exports/x.ts.
function subpathEntry(sourceDir, subpath) {
  const direct = path.join(sourceDir, `${subpath}.ts`);
  return existsSync(direct)
    ? direct
    : path.join(sourceDir, 'exports', `${subpath}.ts`);
}

async function measure(source) {
  const result = await build({
    stdin: { contents: source, resolveDir: ROOT, loader: 'js' },
    bundle: true,
    minify: true,
    write: false,
    format: 'esm',
    platform: 'browser',
    target: 'es2019',
    tsconfig: path.join(ROOT, 'tsconfig.json'),
    plugins: [workspaceSourcePlugin()],
    logLevel: 'silent',
  });
  const code = result.outputFiles[0].contents;
  return { minified: code.length, gzip: gzipSync(code, { level: 9 }).length };
}

async function main() {
  const update = process.argv.includes('--update');
  const sizes = {};
  for (const [name, source] of Object.entries(ENTRIES)) {
    sizes[name] = await measure(source);
  }

  if (update) {
    writeFileSync(BASELINE, `${JSON.stringify(sizes, null, 2)}\n`);
    console.log('Recorded bundle-size baseline:');
    console.table(sizes);
    return;
  }

  const baseline = JSON.parse(readFileSync(BASELINE, 'utf8'));
  const comparisons = Object.entries(sizes).map(([name, size]) =>
    compareSize(name, size, baseline[name]),
  );
  const rows = comparisons.map(({ row }) => row);
  console.table(rows);
  if (comparisons.some(({ failed }) => failed)) {
    console.error(
      `Bundle size grew by more than ${TOLERANCE_BYTES} bytes gzip for an entry. ` +
        'Keep feature code out of the core path, or update the baseline with ' +
        '--update in a PR that justifies the growth.',
    );
    process.exit(1);
  }
}

function compareSize(name, size, base) {
  if (!base) {
    return {
      failed: true,
      row: { entry: name, gzip: size.gzip, baseline: 'missing', delta: '' },
    };
  }
  const delta = size.gzip - base.gzip;
  const failed = delta > TOLERANCE_BYTES;
  return {
    failed,
    row: {
      entry: name,
      gzip: size.gzip,
      baseline: base.gzip,
      delta: `${delta >= 0 ? '+' : ''}${delta}${failed ? ' (over budget)' : ''}`,
    },
  };
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
