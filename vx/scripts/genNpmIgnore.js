const fs = require('fs');

const logger = require('vx/logger');
const packageExports = require('vx/packageExports');
const packageNames = require('vx/packageNames');
const vxPath = require('vx/vxPath');

module.exports = function genNpmIgnore() {
  logger.info('Generating .npmignore files...');

  packageNames.list.forEach(packageName => {
    const npmIgnorePath = vxPath.packageNpmIgnore(packageName);

    let existingContent = template;

    if (fs.existsSync(npmIgnorePath)) {
      existingContent = fs.readFileSync(npmIgnorePath, 'utf8');
    }

    const deconstructed = existingContent.split(/(#.*)/g).filter(Boolean); // [comment, content, comment, content]

    deconstructed[1] = genAutoSection(packageExports[packageName]);

    const newContent = deconstructed.join('');

    if (existingContent === newContent) {
      logger.log(`✅ ${packageName} .npmignore is up to date. Skipping.`);
      return;
    }

    logger.log(`📝 Writing .npmignore file for ${packageName}`);

    fs.writeFileSync(npmIgnorePath, newContent, 'utf8');
  });

  logger.info('👌 Done generating .npmignore files.\n');
};

const template = `# Autogenerated section. Do not edit manually.



# Manual Section. Edit at will.`;

function genAutoSection(packageExports) {
  return `
node_modules
src
!types/
!dist/
tsconfig.json
${packageExports.map(packageExport => `!${packageExport}/`).join('\n')}

`;
}
