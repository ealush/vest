const { exec, logger, packagePath } = require("../../util");

function publishPackage({ packageName, tag }) {
  const command = [
    "yarn",
    "--cwd",
    packagePath(packageName),
    "publish",
    tag && `--tag ${tag}`,
  ]
    .filter(Boolean)
    .join(" ");

  logger.info("🚀 Publishing package.");
  exec(command);
}

module.exports = publishPackage;
