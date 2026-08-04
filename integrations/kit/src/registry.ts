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
export const integrationRegistry = defineIntegrationRegistry([]);
