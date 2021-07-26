import createContext from 'context';

export const ctx = createContext<CTXType>((ctxRef, parentContext): CTXType => {
  if (!parentContext) {
    return {
      value: ctxRef.value,
      parent: emptyParent,
      meta: ctxRef.meta || {},
    };
  } else if (ctxRef.set) {
    return {
      meta: ctxRef.meta || {},
      value: ctxRef.value,
      parent: (): TEnforceContext => stripContext(parentContext),
    };
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
