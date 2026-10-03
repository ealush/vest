import type { IntegrationRecord } from './types.js';

import hono from '../../hono/integration.config.js';
import reactHookForm from '../../react-hook-form/integration.config.js';
import standardSchema from '../../standard-schema/integration.config.js';
import t3Env from '../../t3-env/integration.config.js';
import tanstackForm from '../../tanstack-form/integration.config.js';
import tanstackRouter from '../../tanstack-router/integration.config.js';
import trpc from '../../trpc/integration.config.js';

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

// Each workspace owns its implementation and documentation metadata. The
// registry aggregates those configs for CI selection, generated docs, and
// status output without duplicating per-integration switches.
export const integrationRegistry = defineIntegrationRegistry([
  standardSchema,
  reactHookForm,
  tanstackForm,
  hono,
  trpc,
  t3Env,
  tanstackRouter,
]);
