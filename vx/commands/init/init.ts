import path from 'path';

import exec from 'vx/exec.js';

export type InitOptions = {
  cliOptions?: string;
};

export default function init({ cliOptions }: InitOptions = {}): void {
  exec([
    'node',
    path.resolve(new URL('.', import.meta.url).pathname, './prompt'),
    cliOptions,
  ]);
}
