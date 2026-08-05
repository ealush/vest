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
  category: 'specification',
  documentation: {
    example: { source: 'src/suite.ts', type: 'source' },
    install: 'vest',
    purpose:
      "Standard Schema lets validation consumers invoke a Vest suite or an Enforce schema through a shared interface. This integration uses full-payload Standard Schema validation; it does not substitute for Vest's native focused, retained-state workflow APIs.",
  },
  id: 'standard-schema',
  lastVerified: '2026-08-04',
  limitations: [
    'Standard Schema runs complete validation and does not expose focused execution, retained state, warnings, groups, or race coordination.',
    'Enforce schemas identify their Standard Schema vendor as n4s; Vest suites identify their vendor as vest.',
  ],
  status: 'upstream-pr',
  strategy: 'standard-schema',
  testedVersions: {
    integration: '@standard-schema/spec 1.0.0',
    vest: '6.3.2',
  },
  title: 'Standard Schema',
  upstream: {
    contributionType: 'registry',
    pullRequest: 'https://github.com/standard-schema/standard-schema/pull/177',
    repository: 'standard-schema/standard-schema',
    targetFiles: ['packages/spec/schema.md'],
  },
  websiteRoute: '/docs/integrations/standard-schema',
  workspace: 'integrations/standard-schema',
} satisfies IntegrationRecord;
