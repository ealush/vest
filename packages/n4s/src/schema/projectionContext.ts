import { createContext } from 'context';
import { invariant, isPromise } from 'vest-utils';

const projectionContext = createContext(false);

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
  const result = projectionContext.run(true, fn);
  invariant(
    !isPromise(result),
    'Schema execution projection must remain synchronous.',
  );
  return result;
}

/** @internal */
export function isSchemaExecutionProjection(): boolean {
  return projectionContext.use();
}
