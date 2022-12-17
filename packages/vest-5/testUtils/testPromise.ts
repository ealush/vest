export function TestPromise(cb: (done: () => void) => void): Promise<void> {
  return new Promise<void>(done => cb(done));
}
