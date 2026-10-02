import type { IntegrationRecord } from '../kit/src/types.js';

export default {
  capabilities: {
    asynchronous: false,
    focusedExecution: false,
    inputInference: true,
    multipleIssues: false,
    nestedPaths: false,
    outputInference: true,
    raceSafety: false,
    retainedState: false,
    synchronous: true,
    transformedOutput: true,
  },
  category: 'router',
  documentation: {
    example: {
      component: 'TanStackRouterIntegration',
      description:
        'Edit the URL and use the file tabs to inspect search validation and inferred parsed values.',
      files: ['DemoApp.tsx', 'router.tsx', 'styles.css'],
      sourceExport: 'tanStackRouterFiles',
      type: 'sandpack',
    },
    install: 'vest @tanstack/react-router',
    purpose:
      "TanStack Router accepts a Vest Enforce schema directly as a Standard Schema search-parameter validator. The route rejects invalid URLs and exposes Vest's parsed output as its inferred search type.",
  },
  id: 'tanstack-router',
  lastVerified: '2026-08-04',
  limitations: [
    'TanStack Router requires search validation to be synchronous.',
    'Search parsing is one-shot boundary validation and does not expose Vest stateful interaction features.',
  ],
  status: 'docs-green',
  strategy: 'standard-schema',
  testedVersions: {
    integration: '@tanstack/react-router 1.170.18',
    vest: '6.3.2',
  },
  title: 'TanStack Router',
  upstream: {
    contributionType: 'documentation',
    repository: 'TanStack/router',
    targetFiles: [],
  },
  websiteRoute: '/docs/integrations/tanstack-router',
  workspace: 'integrations/tanstack-router',
} satisfies IntegrationRecord;
