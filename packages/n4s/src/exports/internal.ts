/**
 * Integration surface shared by n4s and Vest.
 *
 * This entry is intentionally separate from the public n4s API. Applications
 * should use schema rules, `dependsOn()`, and `describe()`; Vest alone consumes
 * these planner and mapping operations to implement focused suite execution.
 */
export { assertSchemaRootPathsValid } from '../schema/dependencyResolver';
export { mapWithoutValidation } from '../schema/mapWithoutValidation';
export type { MappingProvenance } from '../schema/mapWithoutValidation';
export {
  parseAffectedFieldName,
  resolveAffectedPaths,
  runSchemaPaths,
} from '../schema/selectiveRun';
export type {
  SelectiveExecutionCoverage,
  SelectiveRunOptions,
  SelectiveSchema,
  SelectiveSchemaResult,
} from '../schema/selectiveRun';
