export default function deferThrow(message?: string): void {
  setTimeout(() => {
    throw new Error(message);
  }, 0);
}

export type TDeferThrow = typeof deferThrow;
