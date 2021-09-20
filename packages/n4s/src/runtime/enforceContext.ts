import assign from 'assign';
import { createContext } from 'context';

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
      parent: (): TEnforceContext => stripContext(parentContext),
    });
  }

  return parentContext;
});

function stripContext(ctx: null | CTXType): TEnforceContext {
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

export type TEnforceContext = null | {
  meta: Record<string, any>;
  value: any;
  parent: () => TEnforceContext;
};

function emptyParent(): null {
  return null;
}
