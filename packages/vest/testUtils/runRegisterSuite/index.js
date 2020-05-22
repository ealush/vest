import registerSuite from '../../src/core/state/registerSuite';
import runWithContext from '../../src/lib/runWithContext';

export default context => runWithContext(context, registerSuite);
