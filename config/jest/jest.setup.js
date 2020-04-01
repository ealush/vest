const glob = require("glob");
const { PACKAGE_NAME_VEST } = require("../../scripts/constants");
const { packagePath, packageJson } = require("../../util");

const { version } = packageJson(PACKAGE_NAME_VEST);

global.vestDistVersions = [];

const isWatchMode = (process.argv || []).some(
  (arg) => arg && arg.includes("--watch")
);

const VEST_DIST_FILES = glob.sync(
  packagePath(PACKAGE_NAME_VEST, "dist", "*.js")
);

if (!isWatchMode) {
  VEST_DIST_FILES.map(require).forEach((file) =>
    global.vestDistVersions.push(file)
  );
}

global.VEST_VERSION = version;

// Registers global instance
require(packagePath(PACKAGE_NAME_VEST, "src"));
