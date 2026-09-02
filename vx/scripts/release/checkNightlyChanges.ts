import listAllChangedPackages from './github/listAllChangedPackages.js';

const changed = listAllChangedPackages();
// eslint-disable-next-line no-console
console.log(changed.size > 0 ? 'true' : 'false');
