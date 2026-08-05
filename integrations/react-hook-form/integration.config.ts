import type { IntegrationRecord } from '../kit/src/types.js';

export default {
  capabilities: {
    asynchronous: true,
    focusedExecution: true,
    inputInference: true,
    multipleIssues: true,
    nestedPaths: true,
    outputInference: true,
    raceSafety: true,
    retainedState: true,
    synchronous: true,
    transformedOutput: true,
  },
  category: 'form',
  documentation: {
    example: {
      component: 'ReactHookFormIntegration',
      description:
        'Edit the form to see focused validation, field arrays, asynchronous checks, and transformed submission data.',
      files: [
        'DemoApp.tsx',
        'integration.ts',
        'vestResolver.ts',
        'suite.ts',
        'styles.css',
      ],
      sourceExport: 'reactHookFormFiles',
      type: 'sandpack',
    },
    install: 'vest react-hook-form @hookform/resolvers @standard-schema/spec',
    purpose:
      'This local resolver connects React Hook Form to a stateful Vest 6 suite and returns transformed submission data.',
  },
  id: 'react-hook-form',
  lastVerified: '2026-08-05',
  limitations: [
    'The resolver candidate exists only in this Vest workspace and is not yet available from @hookform/resolvers/vest.',
    'React Hook Form does not identify submission calls explicitly; unregistered default values and empty containers can make the full-run heuristic ambiguous.',
    'Vest Suite Objects do not expose a cloning API, so the candidate requires a suite factory to isolate full-form calls from retained focused state.',
    'Retained field-array state requires stable item IDs, supplied by getContactKey in this example.',
    'When an unrelated invalid field prevents whole-form transformation during a focused run, the resolver preserves the current input; full-form runs still require and return parsed output.',
    'RHF reset and unmount events are not part of the Resolver contract, so the local integration owner aborts and replaces its suite explicitly; asynchronous checks must honor their AbortSignal.',
  ],
  status: 'docs-green',
  strategy: 'dedicated-adapter',
  testedVersions: {
    integration: 'react-hook-form 7.84.0 and @hookform/resolvers 5.7.1',
    vest: '6.3.2',
  },
  title: 'React Hook Form',
  upstream: {
    contributionType: 'adapter',
    repository: 'react-hook-form/resolvers',
    targetFiles: [
      'vest/src/vest.ts',
      'vest/src/types.ts',
      'vest/src/__tests__',
    ],
  },
  websiteRoute: '/docs/integrations/react-hook-form',
  workspace: 'integrations/react-hook-form',
} satisfies IntegrationRecord;
