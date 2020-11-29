const fs = require('fs');
const path = require('path');

const glob = require('glob');

const { packageNames, packageSrc } = require('../../../../../util');

const rules = glob.sync('./*.js', {
  cwd: packageSrc(packageNames.N4S, 'rules'),
});

const all = [
  ...new Set(
    Object.keys(
      require(packageSrc(packageNames.N4S, 'enforce', 'runtimeRules.js'))
    ).concat(rules.map(rule => path.basename(rule, '.js')))
  ),
];

// This will generate a partial list of enforce rules
// only based on the file names
fs.writeFileSync(
  path.join(__dirname, 'fixtures', 'rules.ts'),
  `import { enforce } from 'vest';${all
    .map(name => {
      return `\nenforce(0).${name};\nenforce.${name};`;
    })
    .join('')}`,
  'utf8'
);
