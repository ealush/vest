import type { IntegrationRecord } from '../kit/src/types.js';

export default {
  capabilities: {
    asynchronous: true,
    focusedExecution: false,
    inputInference: true,
    multipleIssues: true,
    nestedPaths: true,
    outputInference: true,
    raceSafety: false,
    retainedState: false,
    synchronous: true,
    transformedOutput: true,
  },
  category: 'server',
  documentation: {
    example: {
      component: 'HonoIntegration',
      description:
        'Edit the request JSON and use the file tabs to inspect the middleware, Vest suite, and React client.',
      files: ['DemoApp.tsx', 'app.ts', 'styles.css'],
      sourceExport: 'honoFiles',
      type: 'sandpack',
    },
    install: 'vest hono @hono/standard-validator',
    purpose:
      "Hono's Standard Validator middleware accepts a Vest suite directly. The local example executes in-memory requests, rejects invalid JSON before the handler, and passes parsed output to valid handlers.",
  },
  id: 'hono',
  lastVerified: '2026-08-04',
  limitations: [
    'Standard Schema middleware validates complete requests and does not expose Vest stateful interaction features.',
  ],
  status: 'docs-green',
  strategy: 'standard-schema',
  testedVersions: {
    integration: 'Hono 4.13.0; @hono/standard-validator 0.3.0',
    vest: '6.3.2',
  },
  title: 'Hono',
  upstream: {
    contributionType: 'documentation',
    repository: 'honojs/middleware',
    targetFiles: [],
  },
  websiteRoute: '/docs/integrations/hono',
  workspace: 'integrations/hono',
} satisfies IntegrationRecord;
