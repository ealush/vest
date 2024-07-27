/* eslint-disable sort-keys */
import path from 'path';

import fsExtra from 'fs-extra';
import * as glob from 'glob';
import inquirer from 'inquirer';
import exec from 'vx/exec.js';
import logger from 'vx/logger.js';
import packageNames from 'vx/packageNames.js';
import vxPath from 'vx/vxPath.js';

inquirer
  .prompt([
    {
      type: 'input',
      name: 'name',
      message: 'What is the name of the new package?',
    },
    {
      type: 'input',
      name: 'description',
      message: 'What is the description of the package?',
    },
    {
      type: 'input',
      name: 'author',
      message: 'What is the author of the package?',
      default: 'ealush',
    },
    {
      type: 'input',
      name: 'license',
      message: 'What is the license of the package?',
      default: 'MIT',
    },
    {
      type: 'input',
      name: 'version',
      message: 'What is the version of the package?',
      default: '0.0.0',
    },
  ])
  .then(answers => {
    if (doesPackageExist(answers.name)) {
      logger.error(`Package ${answers.name} already exists`);
      return;
    }

    logger.log(answers);

    scaffold(answers);
  })
  .catch(error => {
    if (error.isTtyError) {
      logger.error("Prompt couldn't be rendered in the current environment");
    } else {
      logger.error(error);
    }
  });

function doesPackageExist(packageName) {
  return packageNames.names[packageName] !== undefined;
}

function scaffold(config) {
  logger.log('⚒ Generating package from template');

  const template = path.resolve(vxPath.VX_COMMANDS_PATH, 'init/template');
  const packagePath = vxPath.package(config.name);
  fsExtra.copySync(path.join(template), packagePath);

  writeEntryPoint(packagePath, config.name);
  updateValues(packagePath, config);

  exec(['yarn']);
  exec(['yarn', 'vx build', '-p', config.name]);
}

function writeEntryPoint(packagePath, packageName) {
  fsExtra.ensureFileSync(vxPath.packageSrc(packageName, `${packageName}.ts`));
  fsExtra.writeFileSync(
    vxPath.packageSrc(packageName, `${packageName}.ts`),
    `export const main = () => "${packageName}";`,
    'utf8',
  );
}

function updateValues(packagePath, config) {
  glob.sync(packagePath + '/**/*').forEach(file => {
    if (fsExtra.lstatSync(file).isFile()) {
      let content = fsExtra.readFileSync(file, 'utf8');

      Object.keys(configMapping).forEach(key => {
        content = content.replace(
          new RegExp(`{{${key}}}`, 'g'),
          config[configMapping[key]] ?? configMapping[key],
        );
      });

      fsExtra.writeFileSync(file, content, 'utf8');
    }
  });
}

const configMapping = {
  PACKAGE_AUTHOR: 'author',
  PACKAGE_DESCRIPTION: 'description',
  PACKAGE_LICENSE: 'license',
  PACKAGE_NAME: 'name',
  PACKAGE_PRIVATE: 'private',
  PACKAGE_VERSION: 'version',
  YEAR: new Date().getFullYear(),
};
