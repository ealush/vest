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
      parent: (): null | CTXType => parentContext,
    };
  }

  return parentContext;
});

export type CTXType = {
  meta: Record<string, any>;
  value: any;
  set?: boolean;
  parent: () => CTXType | null;
};

function emptyParent(): null {
  return null;
}
