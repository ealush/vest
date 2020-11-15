const fs = require('fs');
const path = require('path');

const { moduleAliases, filePaths, logger, exec } = require('../util');

const JSCONF_PATH = path.join(filePaths.ROOT_PATH, 'jsconfig.json');

const jsConfig = require(JSCONF_PATH);

const existingPaths = jsConfig.compilerOptions.paths;
const newPaths = moduleAliases.reduce(
  (paths, { name, relative }) => Object.assign(paths, { [name]: [relative] }),
  {}
);

findDifference(existingPaths, newPaths);

const config = {
  compilerOptions: {
    baseUrl: '.',
    paths: newPaths,
  },
  exclude: ['node_modules', filePaths.DIR_NAME_DIST],
};

fs.writeFileSync(
  path.join(filePaths.ROOT_PATH, 'jsconfig.json'),
  JSON.stringify(config, null, 2),
  'utf8'
);

exec(`yarn prettier ./jsconfig.json -w`);

function findDifference(current, next) {
  const added = [];
  const changed = [];
  const removed = [];

  for (const name in next) {
    if (!current[name]) {
      added.push([name, next[name][0]]);
    } else if (next[name][0] !== current[name][0]) {
      changed.push([name, next[name][0], current[name][0]]);
    }
  }

  for (const name in current) {
    if (!next[name]) {
      removed.push([name, current[name][0]]);
    }
  }

  if (added.length) {
    logger.log(`Files added:`);
    added.forEach(([filename, newPath]) =>
      logger.log(`${filename}: ${newPath}`)
    );
  }
  if (removed.length) {
    logger.log(`Files removed:`);
    removed.forEach(([filename, prevPath]) =>
      logger.log(`${filename}: ${prevPath}`)
    );
  }
  if (changed.length) {
    logger.log(`Files relocated:`);
    changed.forEach(([filename, newPath, prevPath]) =>
      logger.log(`${filename}: ${prevPath} -> ${newPath}`)
    );
  }
}
