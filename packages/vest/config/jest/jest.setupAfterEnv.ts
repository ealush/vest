import isFunction from 'isFunction';

import runCreateRef from '../../testUtils/runCreateRef';

import context from 'ctx';

import './globals.d';

it.withContext = (str, cb, getCTX) => {
  return it(str, () =>
    context.run(
      isFunction(getCTX) ? getCTX() : getCTX ?? { stateRef: runCreateRef() },
      cb
    )
  );
};
