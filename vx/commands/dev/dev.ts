import exec from 'vx/exec.js';
import vxPath from 'vx/vxPath.js';

export default function dev(): void {
  const root = vxPath.vxRoot() ?? vxPath.ROOT_PATH;
  exec(
    `${root}/node_modules/.bin/onchange -d 5000 -i -k ${vxPath.packageSrc(
      '*',
      '**/*.ts',
    )} ${vxPath.packageSrc('*', '**/*.ts')} -- vx prepare`,
  );
}
