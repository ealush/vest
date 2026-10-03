/** Verify that n4s ships the types needed by its emitted validator imports. */
const { readFileSync } = require('node:fs');

const manifest = JSON.parse(readFileSync('packages/n4s/package.json', 'utf8'));
if (!manifest.dependencies?.['@types/validator']) {
  throw new Error('n4s must ship @types/validator as a dependency');
}
for (const entry of ['email', 'date', 'isURL']) {
  for (const extension of ['d.cts', 'd.mts']) {
    const declaration = `packages/n4s/types/exports/${entry}.${extension}`;
    if (!readFileSync(declaration, 'utf8').includes('validator/es/lib/')) {
      throw new Error(
        `${declaration} no longer imports validator/es/lib; @types/validator may no longer be needed as a dependency`,
      );
    }
  }
}
