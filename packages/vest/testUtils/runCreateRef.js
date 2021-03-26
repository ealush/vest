import createStateRef from 'createStateRef';

import createState from 'state';

export default () =>
  createStateRef(createState(), {
    suiteId: 1000,
    name: 'suite_name',
  });
