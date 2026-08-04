import type { IntegrationRecord } from './types.js';

export function defineIntegrationRegistry(
  records: readonly IntegrationRecord[],
): readonly IntegrationRecord[] {
  const ids = new Set<string>();
  const workspaces = new Set<string>();
  const routes = new Set<string>();

  for (const record of records) {
    assertUnique(ids, record.id, 'id');
    assertUnique(workspaces, record.workspace, 'workspace');
    assertUnique(routes, record.websiteRoute, 'website route');

    if (!/^\d{4}-\d{2}-\d{2}$/.test(record.lastVerified)) {
      throw new Error(
        `Integration ${record.id} has an invalid lastVerified date`,
      );
    }
  }

  return Object.freeze([...records]);
}

function assertUnique(values: Set<string>, value: string, label: string): void {
  if (values.has(value)) {
    throw new Error(`Duplicate integration ${label}: ${value}`);
  }
  values.add(value);
}

// Add an entry only when its local compatibility workspace exists. This registry
// is the sole source for CI selection, generated documentation, and status data.
export const integrationRegistry = defineIntegrationRegistry([
  {
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
    id: 'standard-schema',
    lastVerified: '2026-08-04',
    limitations: [
      'Standard Schema runs complete validation and does not expose focused execution, retained state, warnings, groups, or race coordination.',
      'Enforce schemas identify their Standard Schema vendor as n4s; Vest suites identify their vendor as vest.',
    ],
    status: 'docs-green',
    strategy: 'standard-schema',
    testedVersions: {
      integration: '@standard-schema/spec 1.0.0',
      vest: '6.3.2',
    },
    title: 'Standard Schema',
    upstream: {
      contributionType: 'registry',
      repository: 'standard-schema/standard-schema',
      targetFiles: ['packages/spec/schema.md'],
    },
    websiteRoute: '/docs/integrations/standard-schema',
    workspace: 'integrations/standard-schema',
  },
  {
    capabilities: {
      asynchronous: false,
      focusedExecution: false,
      inputInference: true,
      multipleIssues: true,
      nestedPaths: true,
      outputInference: false,
      raceSafety: false,
      retainedState: false,
      synchronous: true,
      transformedOutput: false,
    },
    category: 'form',
    id: 'tanstack-form',
    lastVerified: '2026-08-04',
    limitations: [
      'Generic Standard Schema validation does not use Vest focused execution or retained state.',
      'TanStack Form validates Standard Schema output but does not forward transformed output to the submit callback.',
    ],
    status: 'docs-green',
    strategy: 'standard-schema',
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
]);
