/* eslint-disable sort-keys */
import path from 'path';

import fsExtra from 'fs-extra';
import * as glob from 'glob';
import inquirer from 'inquirer';
import exec from 'vx/exec.js';
import { log, error } from 'vx/logger.js';
import { packageNames } from 'vx/packageNames.js';
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
      error(`Package ${answers.name} already exists`);
      return;
    }

    log(answers);

    scaffold(answers);
  })
  .catch(error => {
    if (error.isTtyError) {
      error("Prompt couldn't be rendered in the current environment");
    } else {
      error(error);
    }
  });

/**
 * Checks if a package with the given name already exists.
 * @param {string} packageName Name of the package to check.
 * @returns {boolean} True if the package exists, false otherwise.
 */
function doesPackageExist(packageName) {
  return packageNames.names[packageName] !== undefined;
}

/**
 * Scaffolds the new package using the template.
 * @param {Object} config Package configuration from prompt answers.
 * @param {string} config.name Package name.
 * @param {string} config.description Package description.
 * @param {string} config.author Package author.
 * @param {string} config.license Package license.
 * @param {string} config.version Package version.
 */
function scaffold(config) {
  log('⚒ Generating package from template');

  const template = path.resolve(vxPath.VX_COMMANDS_PATH, 'init/template');
  const packagePath = vxPath.package(config.name);
  fsExtra.copySync(path.join(template), packagePath);
  removeTemplateExtensionFromFile(packagePath, config.name);

  writeEntryPoint(packagePath, config.name);
  updateValues(packagePath, config);

  exec(['yarn']);
  exec(['yarn', 'vx build', '-p', config.name]);
}

/**
 * Writes the main entry point file for the package.
 * @param {string} packagePath Absolute path to the package directory.
 * @param {string} packageName Name of the package.
 */
function writeEntryPoint(packagePath, packageName) {
  fsExtra.ensureFileSync(vxPath.packageSrc(packageName, `${packageName}.ts`));
  fsExtra.writeFileSync(
    vxPath.packageSrc(packageName, `${packageName}.ts`),
    `export const main = () => "${packageName}";`,
    'utf8',
  );
}

/**
 * Replaces placeholders in template files with actual values.
 * @param {string} packagePath Absolute path to the package directory.
 * @param {Object} config Configuration object with values to replace.
 */
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

/**
 * Renames .tmpl files to remove the extension.
 * @param {string} packagePath Absolute path to the package directory.
 * @param {string} _packageName Package name (unused).
 */
function removeTemplateExtensionFromFile(packagePath, _packageName) {
  glob.sync(packagePath + '/**/*.tmpl').forEach(file => {
    fsExtra.moveSync(file, file.replace('.tmpl', ''));
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
