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

export function addCursorLevel(): void {
  ctx.useX().cursorAt.push(0);
}

export function removeCursorLevel(): void {
  ctx.useX().cursorAt.pop();
}
