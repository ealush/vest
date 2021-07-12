import VestTest from 'VestTest';
import { useTestObjects } from 'stateHooks';

/**
 * Stores test object inside suite state.
 */
export default (testObject: VestTest): void => {
  const [, setTestObjects] = useTestObjects();
  setTestObjects(testObjects => testObjects.concat(testObject));
};
