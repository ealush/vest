import register from '../../src/core/suite/register';
import runWithContext from '../../src/lib/runWithContext';

export default context => runWithContext(context, register);
