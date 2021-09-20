import { createState } from 'vast';

import createStateRef from 'createStateRef';

export default (
  state?: ReturnType<typeof createState>
): ReturnType<typeof createStateRef> =>
  createStateRef(state ? state : createState(), {
    suiteId: '1000',
  });
