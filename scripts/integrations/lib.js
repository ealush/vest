const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const repositoryRoot = path.resolve(__dirname, '../..');
const kitWorkspace = 'integrations/kit';

async function loadRegistry() {
  const registryPath = path.join(
    repositoryRoot,
    kitWorkspace,
    'src/registry.ts',
  );
  const module = await import(pathToFileURL(registryPath).href);
  return module.integrationRegistry;
}

function readWorkspacePackage(workspace) {
  const workspacePath = path.resolve(repositoryRoot, workspace);
  const integrationsRoot = path.join(repositoryRoot, 'integrations');
  if (!workspacePath.startsWith(`${integrationsRoot}${path.sep}`)) {
    throw new Error(
      `Integration workspace is outside integrations/: ${workspace}`,
    );
  }

  const packagePath = path.join(workspacePath, 'package.json');
  if (!fs.existsSync(packagePath)) {
    throw new Error(`Missing integration package: ${packagePath}`);
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  if (packageJson.private !== true) {
    throw new Error(`Integration workspace must be private: ${workspace}`);
  }
  return packageJson;
}

async function loadWorkspaces() {
  const registry = await loadRegistry();
  const workspaces = [
    { id: 'kit', workspace: kitWorkspace },
    ...registry.map(record => ({ id: record.id, workspace: record.workspace })),
  ];

  return workspaces.map(record => ({
    ...record,
    packageJson: readWorkspacePackage(record.workspace),
  }));
}

module.exports = {
  loadRegistry,
  loadWorkspaces,
  repositoryRoot,
};
