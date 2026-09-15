/**
 * Materializes the packed-consumer layout for the adjacent type fixtures.
 *
 * Same pattern as scripts/gate-schema-boundaries.js (packWorkspace +
 * buildConsumer): `yarn pack` each workspace dependency into a temp dir,
 * untar, then PHYSICALLY COPY (no symlinks, no workspace aliases) into
 * ./node_modules so `suite-consumer.mts` / `suite-consumer.cts` resolve the
 * PACKED entries exactly like a real registry install.
 *
 * Run from the repo root:
 *   node type-tests/consumer-typing/setup-packed-consumer.mjs
 */
/* eslint-disable no-console */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FIXTURE_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(FIXTURE_DIR, '..', '..');

// Gate parity: pack targets plus their workspace dependencies so the consumer
// layout resolves offline exactly like a real install.
const PACKED_DEPS = ['n4s', 'vest', 'context', 'vest-utils', 'vestjs-runtime'];

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vest-consumer-typing-'));
try {
  const staged = new Map();
  for (const name of PACKED_DEPS) {
    const pkgDir = path.join(REPO_ROOT, 'packages', name);
    const tgz = path.join(tmp, `${name}.tgz`);
    execFileSync('yarn', ['pack', '--out', tgz], { cwd: pkgDir });
    const unpacked = path.join(tmp, 'pkgs', name);
    fs.mkdirSync(unpacked, { recursive: true });
    execFileSync('tar', ['-xzf', tgz, '-C', unpacked, '--strip-components=1']);
    staged.set(name, unpacked);
  }

  const modules = path.join(FIXTURE_DIR, 'node_modules');
  fs.rmSync(modules, { force: true, recursive: true });
  fs.mkdirSync(modules, { recursive: true });
  for (const [name, dir] of staged) {
    fs.cpSync(dir, path.join(modules, name), { recursive: true });
    console.log(`staged ${name} from packed output`);
  }
  console.log(`consumer node_modules ready at ${modules}`);
} finally {
  fs.rmSync(tmp, { force: true, recursive: true });
}
