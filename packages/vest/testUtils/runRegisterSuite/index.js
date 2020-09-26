import context from '../../src/core/context';
import * as suiteState from '../../src/core/suite/suiteState';

export default ctx => context.run(ctx, suiteState.register);
