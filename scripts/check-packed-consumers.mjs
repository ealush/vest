import { execFileSync } from 'node:child_process';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temporary = mkdtempSync(path.join(tmpdir(), 'vest-packed-consumers-'));
const current = JSON.parse(
  readFileSync(path.join(root, 'node_modules/typescript/package.json'), 'utf8'),
).version;
const minimum = '5.4.5';
const packages = ['context', 'vest-utils', 'vestjs-runtime', 'n4s', 'vest'];

function run(command, args, cwd = temporary) {
  return execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

try {
  const tarballs = path.join(temporary, 'tarballs');
  mkdirSync(tarballs);
  const archives = packages.map(name => {
    const output = JSON.parse(
      run(
        'npm',
        ['pack', '--json', '--ignore-scripts', '--pack-destination', tarballs],
        path.join(root, 'packages', name),
      ),
    );
    return path.join(tarballs, output[0].filename);
  });
  writeFileSync(
    path.join(temporary, 'package.json'),
    JSON.stringify({ private: true, type: 'module' }),
  );
  run('npm', [
    'install',
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
    '--package-lock=false',
    ...archives,
    'typescript-current@npm:typescript@' + current,
    'typescript-minimum@npm:typescript@' + minimum,
  ]);
  const fixture = readFileSync(
    path.join(root, 'scripts/fixtures/relationships-consumer.mts'),
    'utf8',
  );
  writeFileSync(path.join(temporary, 'consumer.mts'), fixture);
  writeFileSync(path.join(temporary, 'consumer.cts'), fixture);
  writeFileSync(
    path.join(temporary, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        target: 'ES2022',
        lib: ['ES2022', 'DOM'],
        strict: true,
        skipLibCheck: false,
        declaration: true,
        outDir: 'output',
      },
      files: ['consumer.mts', 'consumer.cts'],
    }),
  );
  for (const version of ['minimum', 'current']) {
    run(process.execPath, [
      path.join(temporary, 'node_modules/typescript-' + version + '/bin/tsc'),
      '-p',
      'tsconfig.json',
    ]);
    run(process.execPath, ['output/consumer.mjs']);
    run(process.execPath, ['output/consumer.cjs']);
    process.stdout.write(
      'Packed ESM/CJS consumers passed on TypeScript ' +
        (version === 'minimum' ? minimum : current) +
        '\n',
    );
  }
} catch (error) {
  process.stderr.write(
    (error.stdout ?? '') + (error.stderr ?? '') + error.message + '\n',
  );
  process.exitCode = 1;
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
