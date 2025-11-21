const exec = require('vx/exec');

function typecheck() {
  exec('tsc --noEmit -p tsconfig.typecheck.json');
  console.log('✅ Typecheck passed (application code only).');
}

module.exports = typecheck;
