const execSync = require("child_process").execSync;

function exec(command) {
  return execSync(command, { stdio: "inherit" });
}

module.exports = exec;
