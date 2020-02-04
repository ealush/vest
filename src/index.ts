import enforce from 'n4s/dist/enforce.min';
import any from 'anyone/any';
import validate from './core/validate';
import { draft, only, skip, warn } from './hooks';
import test from './core/test';
import { singleton } from './lib';
import { VERSION } from './constants';

// export const vest = {
//     VERSION,
//     enforce,
//     draft,
//     Enforce: enforce.Enforce,
//     test,
//     any,
//     validate,
//     only,
//     skip,
//     warn
// };

export default singleton.register({
    VERSION,
    enforce,
    draft,
    Enforce: enforce.Enforce,
    test,
    any,
    validate,
    only,
    skip,
    warn
});
