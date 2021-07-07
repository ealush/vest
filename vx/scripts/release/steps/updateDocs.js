const path = require('path');

const fse = require('fs-extra');

const packageNames = require('../../../util/packageNames');

const logger = require('vx/logger');
const vxPath = require('vx/vxPath');

const DOCS = 'docs';

const pkgNames = packageNames.names;

const VEST_DOCS_PATH = vxPath.package(pkgNames.vest, DOCS);

function updateDocs() {
  logger.info('📖 Updating documentation.');
  const readme = fse.readFileSync(
    vxPath.package(pkgNames.vest, 'README.md'),
    'utf8'
  );

  fse.ensureDirSync(vxPath.package(pkgNames.vest, DOCS, pkgNames.n4s));
  const enforceLinks = ['rules', 'custom', 'compound', 'external'].reduce(
    (links, name) => {
      const distPath = vxPath.package(
        pkgNames.vest,
        DOCS,
        pkgNames.n4s,
        name + '.md'
      );
      fse.copySync(vxPath.package(pkgNames.n4s, DOCS, name + '.md'), distPath);

      const title = fse
        .readFileSync(distPath, 'utf8')
        .split('\n')[0]
        .replace('# ', '')
        .trim();
      return `${links}\n  - [${title}](./${pkgNames.n4s}/${name})`;
    },
    ''
  );

  const sidebar = fse.readFileSync(
    vxPath.package(pkgNames.vest, DOCS, '_sidebar.md.bak'),
    'utf8'
  );
  const enforce = fse.readFileSync(
    vxPath.package(pkgNames.vest, DOCS, 'enforce.md.bak'),
    'utf8'
  );

  fse.writeFileSync(
    vxPath.package(pkgNames.vest, DOCS, '_sidebar.md'),
    sidebar.replace('{{ENFORCE_DOCS}}', enforceLinks),
    'utf8'
  );

  fse.writeFileSync(
    vxPath.package(pkgNames.vest, DOCS, 'enforce.md'),
    enforce.replace('{{ENFORCE_DOCS}}', enforceLinks),
    'utf8'
  );

  fse.writeFileSync(path.join(VEST_DOCS_PATH, 'README.md'), readme);
  fse.writeFileSync(vxPath.package(pkgNames.vest, 'README.md'), readme);
}

module.exports = updateDocs;
