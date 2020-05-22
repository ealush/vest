import { VEST_DIST_BUILDS } from '../vestBuilds';

const vest = require('../../src');

const runSpec = callback => {
  callback(vest);

  if (!global.isWatchMode) {
    VEST_DIST_BUILDS.forEach(callback);
  }
};

export default runSpec;
