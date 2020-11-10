import enforce from '../packages/n4s/n4s.umd.development.js';

const o = enforce({
  username: 45,
}).shape({
  username: enforce.isBetween(1, 20),
});

console.log(o);
