const fs = require('fs');
const path = require('path');

const glob = require('glob');

const { packageNames, packageSrc } = require('../../util');

const rules = glob.sync('./*.js', {
  cwd: packageSrc(packageNames.N4S, 'rules'),
});

fs.writeFileSync(
  './rules.ts',
  `import { enforce } from '../../../vest';${rules
    .map(r => `\nenforce(0).${path.basename(r, '.js')};`)
    .join('')}`,
  'utf8'
);
