import createStore from '../../lib/createStorage';
import { KEY_CANCELED, KEY_SUITES } from './constants';

export default createStore(() => ({
  [KEY_SUITES]: {},
  [KEY_CANCELED]: {},
}));
