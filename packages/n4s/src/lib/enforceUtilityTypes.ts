import type { CB, DropFirst } from 'vest-utils';

export type EnforceCustomMatcher<F extends CB, R> = (
  ...args: DropFirst<Parameters<F>>
) => R;
