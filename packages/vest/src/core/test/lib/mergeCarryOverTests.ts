import partition from 'partition';

import VestTest from 'VestTest';
import isSameProfileTest from 'isSameProfileTest';
import { useCarryOverTests, useTestObjects } from 'stateHooks';

export default function mergeCarryOverTests(testObject: VestTest): void {
  const [carryOverTests, setCarryOverTests] = useCarryOverTests();
  const [, setTestObjects] = useTestObjects();

  const [moveToTestObjects, keepInCarryOvers] = partition<VestTest>(
    carryOverTests,
    carryOverTest => isSameProfileTest(carryOverTest, testObject)
  );

  setCarryOverTests(() => keepInCarryOvers);
  setTestObjects(testObjects => testObjects.concat(moveToTestObjects));
}
