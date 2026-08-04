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
  writeSandpackSources();
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
  process.stdout.write(
    `Generated ${path.relative(repositoryRoot, outputPath)}\n`,
  );
}

function writeSandpackSources() {
  const groups = {
    honoFiles: [
      'integrations/hono/src',
      ['DemoApp.tsx', 'app.ts', 'styles.css'],
    ],
    productionRegistrationFiles: [
      'examples/production-registration/src',
      [
        'DemoApp.tsx',
        'RegistrationForm.tsx',
        'boundarySchema.ts',
        'registrationSuite.ts',
        'styles.css',
        'types.ts',
      ],
    ],
    tanStackFormFiles: [
      'integrations/tanstack-form/src',
      ['DemoApp.tsx', 'suite.ts', 'styles.css'],
    ],
    tanStackRouterFiles: [
      'integrations/tanstack-router/src',
      ['DemoApp.tsx', 'router.tsx', 'styles.css'],
    ],
  };

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
  const definitions = {
    hono: {
      component: 'HonoIntegration',
      componentPath: 'HonoIntegration',
      install: 'vest hono @hono/standard-validator',
      purpose:
        "Hono's Standard Validator middleware accepts a Vest suite directly. The local proof executes in-memory requests, rejects invalid JSON before the handler, and passes parsed output to valid handlers.",
    },
    'standard-schema': {
      exampleSource: 'integrations/standard-schema/src/suite.ts',
      install: 'vest',
      purpose:
        "Standard Schema lets validation consumers invoke a Vest suite or an Enforce schema through a shared interface. This integration uses full-payload Standard Schema validation; it does not substitute for Vest's native focused, retained-state workflow APIs.",
    },
    't3-env': {
      exampleSource: 'integrations/t3-env/src/env.ts',
      install: 'vest @t3-oss/env-core',
      purpose:
        "T3 Env accepts Standard Schema validators for individual environment variables. Vest's Enforce schemas validate server and client configuration and return parsed values such as a numeric port.",
    },
    'tanstack-form': {
      component: 'TanStackFormIntegration',
      componentPath: 'TanStackFormIntegration',
      install: 'vest @tanstack/react-form',
      purpose:
        'TanStack Form accepts a Vest suite directly as a form-level Standard Schema validator. TanStack owns field state and submission mechanics while Vest validates the complete payload.',
    },
    'tanstack-router': {
      component: 'TanStackRouterIntegration',
      componentPath: 'TanStackRouterIntegration',
      install: 'vest @tanstack/react-router',
      purpose:
        "TanStack Router accepts a Vest Enforce schema directly as a Standard Schema search-parameter validator. The route rejects invalid URLs and exposes Vest's parsed output as its inferred search type.",
    },
    trpc: {
      exampleSource: 'integrations/trpc/src/router.ts',
      install: 'vest @trpc/server',
      purpose:
        "tRPC accepts Standard Schema validators in its procedure input parser. This proof uses a real router and in-process caller, so invalid data is rejected before the procedure and Vest's parsed output reaches valid procedures.",
    },
  };
  const definition = definitions[record.id];
  if (!definition) {
    return undefined;
  }

  const provenCapabilities = Object.entries(record.capabilities)
    .filter(([, supported]) => supported)
    .map(([capability]) => `- ${formatCapability(capability)}`)
    .join('\n');
  const limitations = record.limitations
    .map(limitation => `- ${limitation}`)
    .join('\n');
  const example = renderExample(definition, record);
  const componentImport = definition.component
    ? `\nimport ${definition.component} from '@site/src/components/Sandpack/${definition.componentPath}';\n`
    : '';

  return `---
title: Vest with ${record.title}
description: Tested runtime and type compatibility between Vest and ${record.title}.
---

<!-- GENERATED FILE. Run yarn integrations:docs; do not edit manually. -->
${componentImport}

# Vest with ${record.title}

${definition.purpose}

## Installation

\`\`\`shell
npm install ${definition.install}
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

No upstream change has been created. This page and the local workspace are the Vest-owned proof.
`;
}

function renderExample(definition, record) {
  if (definition.exampleSource) {
    const source = fs
      .readFileSync(path.join(repositoryRoot, definition.exampleSource), 'utf8')
      .trim();
    return `## Implementation example

This source is exercised by the runtime and compile-time checks in the [local compatibility workspace](https://github.com/ealush/vest/tree/latest/${record.workspace}).

\`\`\`ts
${source}
\`\`\``;
  }

  return `## Runnable demonstration

The playground loads the suite, Enforce schema, consumer normalization function, and React demo directly from the [local compatibility workspace](https://github.com/ealush/vest/tree/latest/${record.workspace}). Edit the JSON and switch validation surfaces to inspect their normalized Standard Schema results.

<${definition.component} />`;
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
