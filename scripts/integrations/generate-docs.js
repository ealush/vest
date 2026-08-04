const fs = require('node:fs');
const path = require('node:path');

const { loadRegistry, repositoryRoot } = require('./lib.js');

const outputPath = path.join(
  repositoryRoot,
  'website/docs/integrations/index.md',
);

generate().catch(error => {
  process.stderr.write(`${error.stack ?? error}\n`);
  process.exitCode = 1;
});

async function generate() {
  const registry = await loadRegistry();
  const content = renderIndex(registry);
  fs.writeFileSync(outputPath, content);
  process.stdout.write(
    `Generated ${path.relative(repositoryRoot, outputPath)}\n`,
  );
}

function renderIndex(registry) {
  const sections = [
    ['Specifications and interoperability', ['specification', 'other']],
    ['Form state and framework forms', ['form']],
    ['Server and APIs', ['server']],
    ['Routers and actions', ['router']],
    ['Configuration', ['configuration']],
    ['Data and transport', ['data']],
  ];

  const body = sections
    .map(([title, categories]) => {
      const records = registry.filter(record =>
        categories.includes(record.category),
      );
      return `## ${title}\n\n${renderRecords(records)}`;
    })
    .join('\n\n');

  return `---
title: Ecosystem Integrations
description: Continuously tested Vest compatibility with TypeScript ecosystem tools.
---

<!-- GENERATED FILE. Run yarn integrations:docs; do not edit manually. -->

# Ecosystem Integrations

Every listed integration is backed by a private local workspace that imports the real consumer package, runs runtime and type checks, and builds its documented example. An upstream contribution is proposed only after the Vest-side proof is green.

Standard Schema entries prove full-payload interoperability. Focused execution, retained state, and race coordination are listed only when an integration directly exercises Vest's native Suite Object API.

${body}
`;
}

function renderRecords(records) {
  if (records.length === 0) {
    return '_No local integration has been registered in this category yet._';
  }

  const header =
    '| Integration | Status | Tested versions | Mechanism | Runtime | Types | Demo | Upstream |\n| --- | --- | --- | --- | --- | --- | --- | --- |';
  const rows = records.map(record => {
    const proof = proofState(record.status);
    const upstream = record.upstream.pullRequest
      ? `[PR](${record.upstream.pullRequest})`
      : record.upstream.issue
        ? `[RFC](${record.upstream.issue})`
        : 'Not opened';
    return `| [${record.title}](${record.websiteRoute}) | ${record.status} | Vest ${record.testedVersions.vest}; ${record.testedVersions.integration} | ${record.strategy} | ${proof.runtime} | ${proof.types} | ${proof.demo} | ${upstream} |`;
  });
  return [header, ...rows].join('\n');
}

function proofState(status) {
  if (status === 'local-green') {
    return { demo: '⏳', runtime: '✅', types: '✅' };
  }
  if (
    [
      'docs-green',
      'ready-upstream',
      'upstream-rfc',
      'upstream-pr',
      'merged',
    ].includes(status)
  ) {
    return { demo: '✅', runtime: '✅', types: '✅' };
  }
  if (status === 'blocked') {
    return { demo: '—', runtime: '—', types: '—' };
  }
  return { demo: '❌', runtime: '❌', types: '❌' };
}
