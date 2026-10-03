const { createRequire } = require('node:module');
const { performance } = require('node:perf_hooks');
const path = require('node:path');

const vest = createRequire(path.join(process.argv[2], 'package.json'))('vest');
const schema = vest.enforce.shape({
  rows: vest.enforce.isArrayOf(
    vest.enforce.shape({ price: vest.enforce.isNumber() }),
  ),
});
const suite = vest
  .create(() => vest.test('rows', () => true), schema)
  .only('rows');
const data = { rows: Array.from({ length: 200 }, () => ({ price: 1 })) };

for (let i = 0; i < 1000; i++) suite.run(data);
const start = performance.now();
for (let i = 0; i < 1000; i++) suite.run(data);
process.stdout.write(String((performance.now() - start) / 1000));
