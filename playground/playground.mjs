import vest, { enforce } from 'vest';

const o = enforce({
  username: 45,
}).shape({
  username: enforce.isBetween(1, 20),
});

console.log(o);
