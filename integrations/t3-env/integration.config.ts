import type { IntegrationRecord } from '../kit/src/types.js';

export default {
  capabilities: {
    asynchronous: false,
    focusedExecution: false,
    inputInference: true,
    multipleIssues: true,
    nestedPaths: false,
    outputInference: true,
    raceSafety: false,
    retainedState: false,
    synchronous: true,
    transformedOutput: true,
  },
  category: 'configuration',
  documentation: {
    example: { source: 'src/env.ts', type: 'source' },
    install: 'vest @t3-oss/env-core',
    purpose:
      "T3 Env accepts Standard Schema validators for individual environment variables. Vest's Enforce schemas validate server and client configuration and return parsed values such as a numeric port.",
  },
  id: 't3-env',
  lastVerified: '2026-08-04',
  limitations: [
    'T3 Env validates each variable independently, so Enforce schemas are a more natural fit than a stateful Vest suite.',
    'Environment parsing is a one-shot configuration boundary rather than an interactive workflow.',
  ],
  status: 'docs-green',
  strategy: 'standard-schema',
  testedVersions: {
    integration: '@t3-oss/env-core 0.13.11',
    vest: '6.3.2',
  },
  title: 'T3 Env',
  upstream: {
    contributionType: 'documentation',
    repository: 't3-oss/t3-env',
    targetFiles: [],
  },
  websiteRoute: '/docs/integrations/t3-env',
  workspace: 'integrations/t3-env',
} satisfies IntegrationRecord;
