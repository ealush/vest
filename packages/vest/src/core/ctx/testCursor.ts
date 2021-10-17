import ctx from 'ctx';

export function usePath(): number[] {
  const context = ctx.useX();
  return context.testCursor.getCursor();
}

export function useCursorAt(): number {
  const context = ctx.useX();
  return context.testCursor.cursorAt();
}

export function moveForward(): number {
  const context = ctx.useX();

  return context.testCursor.next();
}

export function addLevel(): void {
  const context = ctx.useX();
  context.testCursor.addLevel();
}

export function removeLevel(): void {
  const context = ctx.useX();
  context.testCursor.removeLevel();
}
