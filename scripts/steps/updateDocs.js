const fs = require("fs");
const { logger, packagePath } = require("../../util");
const { PACKAGE_NAME_VEST } = require("../constants");

function updateDocs() {
  logger.info("📖 Updating documentation.");
  const readme = fs.readFileSync("./README.md", "utf8");
  const n4sRules = fs
    .readFileSync("./node_modules/n4s/docs/rules.md", "utf8")
    .replace("\n#", "\n##");
  const enforceDoc = fs.readFileSync("./docs/enforce.md.bak", "utf8");

  const nextDoc = enforceDoc.replace("{{LIST_OF_ENFORCE_RULES}}", n4sRules);

  fs.writeFileSync("./docs/enforce.md", nextDoc);
  fs.writeFileSync("./docs/README.md", readme);
  fs.writeFileSync(packagePath(PACKAGE_NAME_VEST, "README.md"), readme);
}

module.exports = updateDocs;
