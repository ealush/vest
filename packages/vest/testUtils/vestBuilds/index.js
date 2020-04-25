const glob = require('glob');

const { PACKAGE_NAME_VEST } = require('../../../../scripts/constants');
const { packagePath } = require('../../../../util');
const vest = require('../../src/index');

export const VEST_DIST_BUILDS = glob
  .sync(packagePath(PACKAGE_NAME_VEST, 'dist', '*.js'))
  .map(require);

export const ALL_VEST_BUILDS = [vest, ...VEST_DIST_BUILDS];
