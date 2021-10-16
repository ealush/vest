import last from 'last';

import ctx from 'ctx';

export function useCursorAt(): number {
  return last(ctx.useX().cursorAt);
}

export function moveCursorAtForward(): number {
  const cursorAt = ctx.useX().cursorAt;

  const nextCursor = cursorAt[cursorAt.length - 1]++;

  return nextCursor;
}
