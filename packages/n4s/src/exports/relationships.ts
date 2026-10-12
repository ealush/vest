/** Opt-in relationship resolution for n4s schemas. */
import { describeSchema } from '../relationshipGraph';
import { installDescribe } from '../ruleMeta';

installDescribe(describeSchema);

export { EnforceSchemaError } from '../relationshipGraph';
/** @internal Package integration contract used by `vest/relationships`. */
export { validateRelationshipFields } from '../relationshipValidation';
/**
 * @internal Package integration contract used by `vest/relationships`:
 * resolves and caches a schema's graph, throwing for invalid declarations,
 * without the defensive copy `schema.describe()` returns.
 */
export { resolveGraph as resolveRelationships } from '../relationshipGraph';
export { resolveAffected } from '../relationshipPlanner';
export type { ConcretePath } from '../relationshipPlanner';
export type {
  CheckDependencies,
  DeclaredDependencies,
  DependencyResolver,
  Description,
  FieldReference,
  Relationship,
  SchemaPath,
  Scope,
} from '../ruleMeta';
