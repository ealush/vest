const fs = require('node:fs');
const path = require('node:path');

const { loadRegistry, repositoryRoot } = require('./lib.js');

writeStatus().catch(error => {
  process.stderr.write(`${error.stack ?? error}\n`);
  process.exitCode = 1;
});

async function writeStatus() {
  const registry = await loadRegistry();
  const status = {
    generatedAt: new Date().toISOString(),
    integrations: registry,
  };
  const output = `${JSON.stringify(status, null, 2)}\n`;
  const target = process.argv[2];

  if (target) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, output);
    process.stdout.write(`Wrote ${path.relative(repositoryRoot, target)}\n`);
  } else {
    process.stdout.write(output);
  }
}
