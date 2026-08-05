const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const { loadRegistry, repositoryRoot } = require('./lib.js');

const outputPath = path.join(
  repositoryRoot,
  'website/docs/integrations/index.md',
);
const sourceOutputPath = path.join(
  repositoryRoot,
  'website/src/generated/sandpackSources.js',
);

generate().catch(error => {
  process.stderr.write(`${error.stack ?? error}\n`);
  process.exitCode = 1;
});

async function generate() {
  const registry = await loadRegistry();
  const content = renderIndex(registry);
  fs.writeFileSync(outputPath, content);
  for (const record of registry) {
    const page = renderIntegrationPage(record);
    if (page) {
      const pagePath = path.join(
        repositoryRoot,
        `website/docs/integrations/${record.id}.md`,
      );
      fs.writeFileSync(pagePath, page);
    }
  }
  writeSandpackSources(registry);
  execFileSync(
    'yarn',
    [
      'prettier',
      '--write',
      'website/docs/integrations',
      'website/src/generated/sandpackSources.js',
    ],
    { cwd: repositoryRoot, stdio: 'inherit' },
  );
  execFileSync('yarn', ['build:llms'], {
    cwd: repositoryRoot,
    stdio: 'inherit',
  });
  process.stdout.write(
    `Generated ${path.relative(repositoryRoot, outputPath)}\n`,
  );
}

function writeSandpackSources(registry) {
  const groups = Object.fromEntries(
    registry
      .filter(record => record.documentation.example.type === 'sandpack')
      .map(record => {
        const example = record.documentation.example;
        return [
          example.sourceExport,
          [path.join(record.workspace, 'src'), example.files],
        ];
      }),
  );
  groups.productionRegistrationFiles = [
    'examples/production-registration/src',
    [
      'DemoApp.tsx',
      'RegistrationForm.tsx',
      'boundarySchema.ts',
      'registrationSuite.ts',
      'styles.css',
      'types.ts',
    ],
  ];

  const exports = Object.entries(groups).map(([exportName, [base, files]]) => {
    const sources = Object.fromEntries(
      files.map(file => [
        `/${file === 'DemoApp.tsx' ? 'App.tsx' : file}`,
        fs.readFileSync(path.join(repositoryRoot, base, file), 'utf8'),
      ]),
    );
    return `export const ${exportName} = ${JSON.stringify(sources, null, 2)};`;
  });

  fs.mkdirSync(path.dirname(sourceOutputPath), { recursive: true });
  fs.writeFileSync(
    sourceOutputPath,
    `// GENERATED FILE. Run yarn integrations:docs; do not edit manually.\n\n${exports.join('\n\n')}\n`,
  );
}

function renderIntegrationPage(record) {
  const documentation = record.documentation;

  const provenCapabilities = Object.entries(record.capabilities)
    .filter(([, supported]) => supported)
    .map(([capability]) => `- ${formatCapability(capability)}`)
    .join('\n');
  const limitations = record.limitations
    .map(limitation => `- ${limitation}`)
    .join('\n');
  const example = renderExample(documentation.example, record);
  const componentImport =
    documentation.example.type === 'sandpack'
      ? `\nimport ${documentation.example.component} from '@site/src/components/Sandpack/${documentation.example.component}';\n`
      : '';

  return `---
title: Vest with ${record.title}
description: Tested runtime and type compatibility between Vest and ${record.title}.
---

<!-- GENERATED FILE. Run yarn integrations:docs; do not edit manually. -->
${componentImport}

# Vest with ${record.title}

${documentation.purpose}

## Installation

\`\`\`shell
npm install ${documentation.install}
\`\`\`

The compatibility workspace pins ${record.testedVersions.integration} and imports only public package entry points.

${example}

## Tested versions

- Vest ${record.testedVersions.vest}
- ${record.testedVersions.integration}

## Proven capabilities

${provenCapabilities}

Runtime tests, compile-time inference tests, and the browser build run through \`yarn integrations:verify\`.

## Known limitations

${limitations}

## Upstream status

${renderUpstreamStatus(record)}
`;
}

function renderExample(example, record) {
  if (example.type === 'source') {
    const source = fs
      .readFileSync(
        path.join(repositoryRoot, record.workspace, example.source),
        'utf8',
      )
      .trim();
    return `## Implementation example

This source is exercised by the runtime and compile-time checks in the [local compatibility workspace](https://github.com/ealush/vest/tree/latest/${record.workspace}).

\`\`\`ts
${source}
\`\`\``;
  }

  return `## Runnable demonstration

The playground loads its tested source directly from the [local compatibility workspace](https://github.com/ealush/vest/tree/latest/${record.workspace}). ${example.description}

<${example.component} />`;
}

function renderUpstreamStatus(record) {
  if (record.upstream.pullRequest) {
    return `Tracked in [${record.upstream.repository} PR](${record.upstream.pullRequest}).`;
  }
  if (record.upstream.issue) {
    return `Tracked in [${record.upstream.repository}](${record.upstream.issue}).`;
  }
  return 'No upstream change has been created. This page and the local workspace are the Vest-owned proof.';
}

function formatCapability(capability) {
  return capability.replace(/[A-Z]/g, letter => ` ${letter.toLowerCase()}`);
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
