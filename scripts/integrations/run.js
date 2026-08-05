const { execFileSync } = require('node:child_process');

const { loadWorkspaces, repositoryRoot } = require('./lib.js');

const task = process.argv[2];
const supportedTasks = new Set(['test', 'typecheck', 'build', 'verify']);

if (!supportedTasks.has(task)) {
  throw new Error(
    `Expected one of ${[...supportedTasks].join(', ')}, received ${task ?? 'nothing'}`,
  );
}

run().catch(error => {
  process.stderr.write(`${error.stack ?? error}\n`);
  process.exitCode = 1;
});

async function run() {
  if (task === 'verify') {
    for (const verificationTask of ['test', 'typecheck', 'build']) {
      await runTask(verificationTask);
    }
    execFileSync('yarn', ['integrations:docs'], {
      cwd: repositoryRoot,
      stdio: 'inherit',
    });
    return;
  }

  await runTask(task);
}

async function runTask(workspaceTask) {
  const workspaces = await loadWorkspaces();
  for (const { id, packageJson } of workspaces) {
    if (!packageJson.scripts?.[workspaceTask]) {
      throw new Error(
        `Integration ${id} does not define the ${workspaceTask} script`,
      );
    }

    process.stdout.write(`Running ${workspaceTask} for ${packageJson.name}\n`);
    execFileSync('yarn', ['workspace', packageJson.name, workspaceTask], {
      cwd: repositoryRoot,
      stdio: 'inherit',
    });
  }
}
