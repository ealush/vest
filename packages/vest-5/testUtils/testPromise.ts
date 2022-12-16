export function TestPromise(cb) {
  return new Promise<void>(done => cb(done));
}
