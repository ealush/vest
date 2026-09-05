let projectionDepth = 0;

/**
 * Runs an internal selective-validation fragment after the relationship graph
 * has already been consumed by the planner.
 *
 * `dependsOn()` is invalidation metadata, not executable validation. A
 * projected fragment therefore must not re-resolve or enforce relationship
 * providers merely to execute the validators the planner selected. The
 * original user schema remains unchanged and keeps its normal composition
 * and standalone-root checks outside this synchronous boundary.
 *
 * @internal
 */
export function withSchemaExecutionProjection<T>(fn: () => T): T {
  projectionDepth += 1;
  try {
    return fn();
  } finally {
    projectionDepth -= 1;
  }
}

/** @internal */
export function isSchemaExecutionProjection(): boolean {
  return projectionDepth > 0;
}
