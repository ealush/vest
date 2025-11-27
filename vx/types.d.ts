declare module 'fs-extra';
declare module 'inquirer';
declare module 'node-fetch' {
  const fetch: typeof globalThis.fetch;
  export default fetch;
}
