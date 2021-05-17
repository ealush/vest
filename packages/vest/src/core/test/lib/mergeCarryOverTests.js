import isSameProfileTest from 'isSameProfileTest';
import partition from 'partition';
import { useCarryOverTests, useTestObjects } from 'stateHooks';

export default function mergeCarryOverTests(testObject) {
  const [carryOverTests, setCarryOverTests] = useCarryOverTests();
  const [, setTestObjects] = useTestObjects();

  const [moveToTestObjects, keepInCarryOvers] = partition(
    carryOverTests,
    carryOverTest => isSameProfileTest(carryOverTest, testObject)
  );

  setCarryOverTests(() => keepInCarryOvers);
  setTestObjects(testObjects => testObjects.concat(moveToTestObjects));
}
