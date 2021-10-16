import ctx from 'ctx';

export function useTestCursorAt(): number {
  const context = ctx.useX();
  return context.testCursor.cursorAt();
}

export function moveTestCursorForward(): number {
  const context = ctx.useX();
  return context.testCursor.next();
}

export function addTestCursorLevel(): void {
  const context = ctx.useX();
  context.testCursor.addLevel();
}

export function removeTestCursorLevel(): void {
  const context = ctx.useX();
  context.testCursor.removeLevel();
}
