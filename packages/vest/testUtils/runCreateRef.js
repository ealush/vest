import createState from 'vast';

import createStateRef from 'createStateRef';

export default state =>
  createStateRef(state ? state : createState(), {
    suiteId: 1000,
    name: 'suite_name',
  });
