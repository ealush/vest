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
    example: { source: 'src/router.ts', type: 'source' },
    install: 'vest @trpc/server',
    purpose:
      "tRPC accepts Standard Schema validators in its procedure input parser. This example uses a real router and in-process caller, so invalid data is rejected before the procedure and Vest's parsed output reaches valid procedures.",
  },
  id: 'trpc',
  lastVerified: '2026-08-04',
  limitations: [
    'Procedure input parsing validates complete payloads and does not expose Vest stateful interaction features.',
    'tRPC wraps Standard Schema failures in a BAD_REQUEST error.',
  ],
  status: 'docs-green',
  strategy: 'standard-schema',
  testedVersions: {
    integration: '@trpc/server 11.18.0',
    vest: '6.3.2',
  },
  title: 'tRPC',
  upstream: {
    contributionType: 'documentation',
    repository: 'trpc/trpc',
    targetFiles: [],
  },
  websiteRoute: '/docs/integrations/trpc',
  workspace: 'integrations/trpc',
} satisfies IntegrationRecord;
