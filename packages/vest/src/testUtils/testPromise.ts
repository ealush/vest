export function TestPromise(cb: (_done: () => void) => void): Promise<void> {
  return new Promise<void>(done => cb(done));
}
