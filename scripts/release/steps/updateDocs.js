const fs = require('fs');
const path = require('path');

const { logger, packagePath, packageNames } = require('../../../util');

const VEST_DOCS_PATH = packagePath(packageNames.VEST, 'docs');

function updateDocs() {
  logger.info('📖 Updating documentation.');
  const readme = fs.readFileSync('./README.md', 'utf8');
  const n4sRules = fs.readFileSync(
    packagePath(packageNames.N4S, 'docs', 'rules.md'),
    'utf8'
  );
  const customRules = fs.readFileSync(
    packagePath(packageNames.N4S, 'docs', 'custom.md'),
    'utf8'
  );
  const shape = fs.readFileSync(
    packagePath(packageNames.N4S, 'docs', 'shape.md'),
    'utf8'
  );

  const enforceDoc = fs.readFileSync(
    path.join(VEST_DOCS_PATH, 'enforce.md.bak'),
    'utf8'
  );

  const nextEnforceDoc = enforceDoc.replace(
    '{{COPIED_ENFORCE_DOCS}}',
    [n4sRules, customRules, shape].join('\n\n').replace(/^#|\n#/g, '\n##')
  );

  fs.writeFileSync(path.join(VEST_DOCS_PATH, 'enforce.md'), nextEnforceDoc);
  fs.writeFileSync(path.join(VEST_DOCS_PATH, 'README.md'), readme);
  fs.writeFileSync(packagePath(packageNames.VEST, 'README.md'), readme);
}

module.exports = updateDocs;
