import isFunction from 'isFunction';

import ctx from 'ctx';
import { addCursorLevel, removeCursorLevel } from 'cursorAt';

export function pocket(
  { type = PocketType.DEFAULT }: { type?: PocketType },
  callback: () => void
): void {
  if (!isFunction(callback)) {
    return;
  }

  ctx.run({ pocket: { type } }, () => {
    addCursorLevel();
    callback();
    removeCursorLevel();
  });
}

export enum PocketType {
  DEFAULT,
  SUITE,
  EACH,
}
