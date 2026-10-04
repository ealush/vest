/** Opt-in relationship resolution for n4s schemas. */
import { describeSchema } from '../relationshipGraph';
import { installDescribe } from '../ruleMeta';

installDescribe(describeSchema);

export { EnforceSchemaError } from '../relationshipGraph';
export { resolveAffected } from '../relationshipPlanner';
export type { ConcretePath } from '../relationshipPlanner';
export { FIELD } from '../ruleMeta';
export type {
  DependencyResolver,
  Description,
  Relationship,
  SchemaPath,
  Scope,
} from '../ruleMeta';
