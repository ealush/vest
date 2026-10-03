/** Opt-in relationship resolution for n4s schemas. */
import { describeSchema } from '../relationshipGraph';
import { installDescribe } from '../ruleMeta';

installDescribe(describeSchema);

export { EnforceSchemaError } from '../relationshipGraph';
export { FIELD } from '../ruleMeta';
export type {
  DependencyResolver,
  Description,
  Relationship,
  SchemaPath,
  Scope,
} from '../ruleMeta';
