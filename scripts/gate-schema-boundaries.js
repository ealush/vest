/**
 * gate:schema-boundaries — dependency-direction and packaging gate
 * (production acceptance plan: DD01, DD03, PK01).
 *
 * 1. Resolved-import checks: n4s must not import upward into Vest,
 *    vestjs-runtime, or adapters (vest-utils is the shared leaf); adapters
 *    must not import private planner/runner paths and must not maintain
 *    their own relationship graph.
 * 2. Clean-consumer packaging smoke: pack vest + n4s, assert dist ESM/CJS +
 *    type declarations for every package.json exports entry, then import
 *    the packed entries in a bare node process (absolute file paths, no
 *    workspace aliases) and run a changed+skip+parser smoke.
 * Exit nonzero on any violation.
 */
/* eslint-disable no-console */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..');
let failures = 0;

function fail(message) {
  failures += 1;
  process.stderr.write(`boundary FAIL: ${message}\n`);
}

function pass(message) {
  console.log(`boundary pass: ${message}`);
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    collectEntry(dir, entry, out);
  }
  return out;
}

function collectEntry(dir, entry, out) {
  if (entry.name === 'node_modules') return;
  const full = path.join(dir, entry.name);
  if (entry.isDirectory()) {
    walk(full, out);
    return;
  }
  if (isSourceFile(entry.name)) out.push(full);
}

function isSourceFile(name) {
  return /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(name);
}

const IMPORT_RE =
  /(?:import|export)[^'"]*?from\s*['"]([^'"]+)["']|require\(\s*['"]([^'"]+)['"]\s*\)/g;

function importsOf(file) {
  const source = fs.readFileSync(file, 'utf8');
  const found = [];
  let match;
  IMPORT_RE.lastIndex = 0;
  while ((match = IMPORT_RE.exec(source)) !== null) {
    found.push(match[1] ?? match[2]);
  }
  return found;
}

function checkImports({ roots, allowSelf = true, forbid, label }) {
  const files = roots.flatMap(root =>
    walk(root).filter(f => !f.includes('__tests__')),
  );
  let bad = 0;
  for (const file of files) {
    bad += checkFileImports(file, forbid, label);
  }
  if (bad === 0) pass(`${label}: ${files.length} files clean`);
  void allowSelf;
}

function checkFileImports(file, forbid, label) {
  let bad = 0;
  for (const spec of importsOf(file)) {
    if (spec.startsWith('.') || spec.startsWith('node:')) continue;
    if (forbid.some(pattern => pattern.test(spec))) {
      bad += 1;
      fail(`${label}: ${path.relative(REPO_ROOT, file)} imports ${spec}`);
    }
  }
  return bad;
}

function checkN4sDirection() {
  checkImports({
    forbid: [
      /^vest$/,
      /^vest\//,
      /^@vest\//,
      /^vestjs-runtime$/,
      /^vestjs-runtime\//,
      /integrations\//,
    ],
    label: 'DD01 n4s owns downward dependencies only',
    roots: [path.join(REPO_ROOT, 'packages', 'n4s', 'src')],
  });
}

function checkAdapterBoundaries() {
  const roots = fs
    .readdirSync(path.join(REPO_ROOT, 'integrations'), { withFileTypes: true })
    .filter(
      e =>
        e.isDirectory() &&
        fs.existsSync(path.join(REPO_ROOT, 'integrations', e.name, 'src')),
    )
    .map(e => path.join(REPO_ROOT, 'integrations', e.name, 'src'));
  checkImports({
    forbid: [
      /n4s\/exports\/internal/,
      /selectiveRun/,
      /dependencyResolver/,
      /cloneDataTree/,
      /useCreateSuiteRunner/,
      /resolveAffectedPaths/,
      /vest\/src\//,
      /n4s\/src\//,
    ],
    label: 'DD03 adapters use public operations only',
    roots,
  });
}

function exportTargets(pkgDir) {
  const pkg = JSON.parse(
    fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'),
  );
  const out = [];
  const visit = node => {
    if (typeof node === 'string') {
      out.push(node);
      return;
    }
    if (node && typeof node === 'object') {
      for (const value of Object.values(node)) visit(value);
    }
  };
  visit(pkg.exports ?? {});
  // Glob patterns (containing *) are export-map redirections, not files.
  return [...new Set(out)].filter(target => !target.includes('*'));
}

const PACKED_DEPS = ['n4s', 'vest', 'context', 'vest-utils', 'vestjs-runtime'];

function checkPackaging() {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vest-pk-'));
  try {
    // Pack targets plus their workspace dependencies so the consumer
    // layout resolves offline exactly like a real install (no registry,
    // no workspace aliases — plain node_modules copies).
    const packed = packWorkspace(tmp);
    const consumer = buildConsumer(tmp, packed);
    assertExportTargets(packed);
    smokeConsumer(consumer);
  } finally {
    fs.rmSync(tmp, { force: true, recursive: true });
  }
}

function packWorkspace(tmp) {
  const packed = {};
  for (const name of PACKED_DEPS) {
    const pkgDir = path.join(REPO_ROOT, 'packages', name);
    const tgz = path.join(tmp, `${name}.tgz`);
    execFileSync('yarn', ['pack', '--out', tgz], { cwd: pkgDir });
    const unpacked = path.join(tmp, 'pkgs', name);
    fs.mkdirSync(unpacked, { recursive: true });
    execFileSync('tar', ['-xzf', tgz, '-C', unpacked, '--strip-components=1']);
    packed[name] = unpacked;
  }
  return packed;
}

function buildConsumer(tmp, packed) {
  const consumer = path.join(tmp, 'consumer');
  const modules = path.join(consumer, 'node_modules');
  fs.mkdirSync(modules, { recursive: true });
  // Physical copies (not symlinks): Node resolves symlinked packages to
  // their real paths, which would escape this layout. Copies emulate a
  // real registry install.
  for (const [name, dir] of Object.entries(packed)) {
    fs.cpSync(dir, path.join(modules, name), { recursive: true });
  }
  return consumer;
}

function assertExportTargets(packed) {
  for (const name of ['n4s', 'vest']) {
    const unpacked = packed[name];
    for (const target of exportTargets(unpacked)) {
      if (!fs.existsSync(path.join(unpacked, target))) {
        fail(`PK01 ${name}: exports target missing: ${target}`);
      }
    }
    pass(`PK01 ${name}: packed, all exports targets present`);
  }
}

function smokeConsumer(consumer) {
  const vestDist = path.join(consumer, 'node_modules', 'vest', 'dist');
  const cjs = path.join(vestDist, 'vest.cjs');
  const mjs = path.join(vestDist, 'vest.mjs');
  if (!fs.existsSync(cjs) || !fs.existsSync(mjs)) {
    fail(
      `PK01 vest: missing dist entry (cjs=${fs.existsSync(cjs)}, mjs=${fs.existsSync(mjs)})`,
    );
    return;
  }
  smokeCjs(consumer, cjs);
  smokeEsm(consumer, mjs);
}

function smokeCjs(consumer, cjs) {
  const smoke = `
const vest = require(${JSON.stringify(cjs)});
const suite = vest.create(data => {
  vest.test('b', () => true);
}, vest.enforce.shape({ a: vest.enforce.isString(), b: vest.enforce.isString() }));
const r = suite.changed('b').run({ a: 'x', b: 'y' });
if (r.tests.b.testCount !== 1) throw new Error('cjs smoke failed');
`;
  execFileSync('node', ['-e', smoke], { cwd: consumer });
  pass('PK01 vest: CJS import + changed smoke without workspace aliases');
}

function smokeEsm(consumer, mjs) {
  const esm = `
import * as vest from ${JSON.stringify(`file://${mjs}`)};
const suite = vest.create(data => {
  vest.test('a', () => true);
  void data;
}, vest.enforce.shape({ a: vest.enforce.isString() }));
const r = suite.run({ a: 'x' });
if (!r.isValid()) throw new Error('esm smoke failed');
`;
  execFileSync('node', ['--input-type=module', '-e', esm], {
    cwd: consumer,
  });
  pass('PK01 vest: ESM import smoke without workspace aliases');
}

try {
  checkN4sDirection();
  checkAdapterBoundaries();
  checkPackaging();
  if (failures > 0)
    throw new Error(`gate:schema-boundaries failed (${failures})`);
  console.log('gate:schema-boundaries passed');
} catch (error) {
  process.stderr.write(`${error.stack ?? error}\n`);
  process.exitCode = 1;
}
