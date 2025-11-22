import exec from 'vx/exec.js';
import vxPath from 'vx/vxPath.js';

/**
 * Starts the file watcher to prepare packages on changes.
 */
export default function dev() {
  exec(
    `${vxPath.vxRoot()}/node_modules/.bin/onchange -d 5000 -i -k ${vxPath.packageSrc(
      '*',
      '**/*.ts',
    )} ${vxPath.packageSrc('*', '**/*.ts')} -- vx prepare`,
  );
}
