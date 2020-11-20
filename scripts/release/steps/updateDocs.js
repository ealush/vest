const fs = require('fs');
const path = require('path');

const fsExtra = require('fs-extra');

const {
  logger,
  packagePath,
  packageNames,
  filePaths,
} = require('../../../util');

const VEST_DOCS_PATH = packagePath(packageNames.VEST, filePaths.DIR_NAME_DOCS);

function updateDocs() {
  logger.info('📖 Updating documentation.');
  const readme = fs.readFileSync('./README.md', 'utf8');

  fsExtra.ensureDirSync(
    packagePath(packageNames.VEST, filePaths.DIR_NAME_DOCS, packageNames.N4S)
  );
  const enforceLinks = [
    'rules',
    'custom',
    'compound',
    'template',
    'external',
  ].reduce((links, name) => {
    const distPath = packagePath(
      packageNames.VEST,
      filePaths.DIR_NAME_DOCS,
      packageNames.N4S,
      name + '.md'
    );
    fsExtra.copySync(
      packagePath(packageNames.N4S, filePaths.DIR_NAME_DOCS, name + '.md'),
      distPath
    );

    const title = fs
      .readFileSync(distPath, 'utf8')
      .split('\n')[0]
      .replace('# ', '')
      .trim();
    return `${links}\n  - [${title}](./${packageNames.N4S}/${name})`;
  }, '');

  const sidebar = fs.readFileSync(
    packagePath(packageNames.VEST, filePaths.DIR_NAME_DOCS, '_sidebar.md.bak'),
    'utf8'
  );
  const enforce = fs.readFileSync(
    packagePath(packageNames.VEST, filePaths.DIR_NAME_DOCS, 'enforce.md.bak'),
    'utf8'
  );

  fs.writeFileSync(
    packagePath(packageNames.VEST, filePaths.DIR_NAME_DOCS, '_sidebar.md'),
    sidebar.replace('{{ENFORCE_DOCS}}', enforceLinks),
    'utf8'
  );

  fs.writeFileSync(
    packagePath(packageNames.VEST, filePaths.DIR_NAME_DOCS, 'enforce.md'),
    enforce.replace('{{ENFORCE_DOCS}}', enforceLinks),
    'utf8'
  );

  fs.writeFileSync(path.join(VEST_DOCS_PATH, 'README.md'), readme);
  fs.writeFileSync(packagePath(packageNames.VEST, 'README.md'), readme);
}

updateDocs();
