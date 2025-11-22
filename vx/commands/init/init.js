import path from 'path';

import exec from 'vx/exec.js';

/**
 * Runs the interactive vx init prompt.
 * @param {{ cliOptions?: string }} param0 Additional CLI options forwarded to the prompt.
 */
export default function init({ cliOptions }) {
  exec([
    'node',
    path.resolve(new URL('.', import.meta.url).pathname, './prompt'),
    cliOptions,
  ]);
}
