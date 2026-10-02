import type { IntegrationRecord } from '../kit/src/types.js';

export default {
  capabilities: {
    asynchronous: false,
    focusedExecution: true,
    inputInference: true,
    multipleIssues: true,
    nestedPaths: true,
    outputInference: false,
    raceSafety: false,
    retainedState: true,
    synchronous: true,
    transformedOutput: false,
  },
  category: 'form',
  documentation: {
    example: {
      component: 'TanStackFormIntegration',
      description:
        'Edit either field and use the file tabs to inspect focused change validation and full-form submission validation.',
      files: ['DemoApp.tsx', 'suite.ts', 'styles.css'],
      sourceExport: 'tanStackFormFiles',
      type: 'sandpack',
    },
    install: 'vest @tanstack/react-form',
    purpose:
      'TanStack Form owns field state while an instance-owned Vest suite provides focused change validation and Standard Schema submission validation.',
  },
  id: 'tanstack-form',
  lastVerified: '2026-08-04',
  limitations: [
    "TanStack Form's generic Standard Schema submission validation does not expose Vest's focused execution or retained state; the field validators use the Suite Object API directly.",
    'TanStack Form validates Standard Schema output but does not forward transformed output to the submit callback.',
  ],
  status: 'docs-green',
  strategy: 'native-plus-standard',
  testedVersions: {
    integration: '@tanstack/react-form 1.33.3',
    vest: '6.3.2',
  },
  title: 'TanStack Form',
  upstream: {
    contributionType: 'example',
    repository: 'TanStack/form',
    targetFiles: [],
  },
  websiteRoute: '/docs/integrations/tanstack-form',
  workspace: 'integrations/tanstack-form',
} satisfies IntegrationRecord;
