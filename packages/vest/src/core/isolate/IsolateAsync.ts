import { CB } from 'vest-utils';

import { group } from 'group';

export function IsolateAsync(callback: CB) {
  return group(callback);
}
