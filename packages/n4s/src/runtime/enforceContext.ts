import { createCascade } from 'context';
import { assign, Nullable } from 'vest-utils';

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
