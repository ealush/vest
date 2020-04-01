const fs = require("fs");
const path = require("path");
const { CONFIG_PATH } = require("../../config");
const { exec, logger } = require("../../util");

function buildPackage(packageName) {
  logger.info("🛠 Building package.");

  const buildConfigPath = path.resolve(
    CONFIG_PATH,
    "builds",
    [packageName, "js"].join(".")
  );

  if (!fs.existsSync(buildConfigPath)) {
    return;
  }

  exec(`rollup -c ${buildConfigPath}`);
}

module.exports = buildPackage;
