import { CB, DropFirst } from 'utilityTypes';

export type EnforceCustomMatcher<F extends CB, R> = (
  ...args: DropFirst<Parameters<F>>
) => R;
