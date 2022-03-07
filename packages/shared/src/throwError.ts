export function deferThrow(message?: string): void {
  setTimeout(() => {
    throw new Error(message);
  }, 0);
}
