import { ctx } from 'enforceContext';
import type { EnforceContext } from 'enforceContext';
import { assign } from 'vest-utils';

import { enforceEager } from 'eager';
import { extendEnforce } from 'extendLogic';
import { enforceLazy } from 'lazy';

export { ctx } from 'enforceContext';
export { compose } from 'compose';

type ExtendFn = (rules: Record<string, (...args: any[]) => any>) => void;
type ContextFn = () => EnforceContext;
type Enforce = typeof enforceEager &
  typeof enforceLazy & { extend: ExtendFn; context: ContextFn };

export const enforce = assign(enforceEager, enforceLazy) as Enforce;

enforce.context = function context(): EnforceContext {
  return ctx.use();
};

enforce.extend = function extend(
  rules: Record<string, (...args: any[]) => any>,
) {
  extendEnforce(enforce, rules);
};
