#!/usr/bin/env node
/* eslint-disable no-console */
import { spawn } from 'child_process';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const loaderPath = path.join(currentDir, 'ts-loader.js');
const entryPath = path.join(currentDir, 'cli.ts');

const child = spawn(
  process.execPath,
  ['--loader', loaderPath, entryPath, ...process.argv.slice(2)],
  {
    env: process.env,
    stdio: 'inherit',
  },
);

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});

child.on('error', error => {
  console.error(error);
  process.exit(1);
});
