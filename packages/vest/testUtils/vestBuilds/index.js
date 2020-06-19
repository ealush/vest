const glob = require('glob');

const { PACKAGE_VEST } = require('../../../../shared/constants');
const { packagePath } = require('../../../../util');
const vest = require('../../src/index');

export const VEST_DIST_BUILDS = glob
  .sync(packagePath(PACKAGE_VEST, 'dist', 'vest*.js'))
  .map(require);

export const ALL_VEST_BUILDS = [vest, ...VEST_DIST_BUILDS];
