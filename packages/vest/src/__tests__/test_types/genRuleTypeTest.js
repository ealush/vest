const fs = require('fs');
const path = require('path');

const glob = require('glob');

const { packageNames, packageSrc } = require('../../../../../util');

const rules = glob.sync('./*.js', {
  cwd: packageSrc(packageNames.N4S, 'rules'),
});

// This will generate a partial list of enforce rules
// only based on the file names
fs.writeFileSync(
  path.join(__dirname, 'fixtures', 'rules.ts'),
  `import { enforce } from 'vest';${rules
    .map(r => {
      const name = path.basename(r, '.js');
      return `\nenforce(0).${name};\nenforce.${name};`;
    })
    .join('')}`,
  'utf8'
);
