/** Opt-in relationship resolution for n4s schemas. */
import { describeSchema } from '../relationshipGraph';
import { installDescribe } from '../ruleMeta';

installDescribe(describeSchema);

export { EnforceSchemaError } from '../relationshipGraph';
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
