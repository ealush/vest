import createStateRef from 'createStateRef';
import createState from 'state';

export default state =>
  createStateRef(state ? state : createState(), {
    suiteId: 1000,
    name: 'suite_name',
  });
