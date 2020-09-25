import createStore from '../../lib/createStorage';
import { KEY_CANCELED, KEY_SUITES } from './constants';

export const { get, set, register } = createStore(() => ({
  [KEY_SUITES]: {},
  [KEY_CANCELED]: {},
}));
