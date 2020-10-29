const fs = require('fs');
const path = require('path');

const { logger, packagePath, packageNames } = require('../../../util');

const VEST_DOCS_PATH = packagePath(packageNames.VEST, 'docs');

function updateDocs() {
  logger.info('📖 Updating documentation.');
  const readme = fs.readFileSync('./README.md', 'utf8');
  const n4sRules = fs
    .readFileSync(packagePath(packageNames.N4S, 'docs', 'rules.md'), 'utf8')
    .replace('\n#', '\n##');
  const enforceDoc = fs.readFileSync(
    path.join(VEST_DOCS_PATH, 'enforce.md.bak'),
    'utf8'
  );

  const nextEnforceDoc = enforceDoc.replace(
    '{{LIST_OF_ENFORCE_RULES}}',
    n4sRules
  );

  fs.writeFileSync(path.join(VEST_DOCS_PATH, 'enforce.md'), nextEnforceDoc);
  fs.writeFileSync(path.join(VEST_DOCS_PATH, 'README.md'), readme);
  fs.writeFileSync(packagePath(packageNames.VEST, 'README.md'), readme);
}

module.exports = updateDocs;
