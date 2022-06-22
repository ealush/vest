import { createContext } from 'context';
import { assign } from 'vest-utils';

export const ctx = createContext<CTXType>((ctxRef, parentContext): CTXType => {
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

function stripContext(ctx: null | CTXType): EnforceContext {
  if (!ctx) {
    return ctx;
  }

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
  parent: () => CTXType | null;
};

export type EnforceContext = null | {
  meta: Record<string, any>;
  value: any;
  parent: () => EnforceContext;
};

function emptyParent(): null {
  return null;
}
