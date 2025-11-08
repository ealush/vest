import { createCascade } from 'context';
import { assign, Nullable } from 'vest-utils';

/**
 * Context API for accessing validation state during rule execution.
 * Provides access to the current value being validated, metadata, and parent context.
 * Used internally by rules to track nested validation (e.g., in shape, isArrayOf).
 *
 * @example
 * ```typescript
 * // Access context in custom rules
 * enforce.extend({
 *   customRule: (value: any) => {
 *     const context = enforce.context();
 *     console.log('Current value:', context?.value);
 *     console.log('Metadata:', context?.meta);
 *     return true;
 *   }
 * });
 *
 * // Context is automatically set in nested validations
 * enforce({ user: { name: 'John' } }).shape({
 *   user: enforce.shape({
 *     name: enforce.isString()
 *   })
 * });
 * // When validating 'name', context.parent() gives access to 'user' object
 * ```
 */
export const ctx = createCascade<CTXType>((ctxRef, parentContext): CTXType => {
  const base = {
    value: ctxRef.value,
    meta: ctxRef.meta || {},
  };

  if (!parentContext) {
    return assign(base, {
      parent: emptyParent,
    });
  } else if (ctxRef.set) {
    return assign(base, {
      parent: (): EnforceContext => stripContext(parentContext),
    });
  }

  return parentContext;
});

function stripContext(ctx: CTXType): EnforceContext {
  return {
    value: ctx.value,
    meta: ctx.meta,
    parent: ctx.parent,
  };
}

type CTXType = {
  meta: Record<string, any>;
  value: any;
  set?: boolean;
  parent: () => Nullable<CTXType>;
};

export type EnforceContext = Nullable<{
  meta: Record<string, any>;
  value: any;
  parent: () => EnforceContext;
}>;

function emptyParent(): null {
  return null;
}
