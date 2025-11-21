const exec = require('vx/exec');

function typecheckTests() {
  exec('tsc --noEmit');
  console.log('✅ Typecheck passed (including tests).');
}

module.exports = typecheckTests;
