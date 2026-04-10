import { makeBrand } from 'vest-utils';

import { useDependencies } from '../Runtime';
import { TIsolateTest } from '../isolate/IsolateTest/IsolateTest';
import { VestTest } from '../isolate/IsolateTest/VestTest';
import { SuiteContext } from '../context/SuiteContext';

/**
 * Registers dependencies for a given field.
 * This updates both the runtime dependency map (for validity linking)
 * and the isolate's own data (for persistence across runs).
 */
export function useResetTestDependencies(isolate: TIsolateTest) {
  const { dependenciesRegistered, fieldsRegistered, isReprocessing } =
    SuiteContext.useX();
  const runtimeDeps = useDependencies();
  const { fieldName } = VestTest.getData(isolate);

  if (isReprocessing || dependenciesRegistered.has(isolate)) {
    return;
  }

  // Clear isolate-level
  VestTest.setData(isolate, current => ({
    ...current,
    dependsOn: [],
  }));
  dependenciesRegistered.add(isolate);

  // Clear field-level registry for the first test of this field in the run
  if (!fieldsRegistered.has(fieldName)) {
    runtimeDeps[fieldName] = [];
    fieldsRegistered.add(fieldName);
  }
}

export function useRegisterDependencies(
  fieldName: string,
  dependencies: string[],
  isolate?: TIsolateTest,
) {
  const runtimeDeps = useDependencies();

  for (const depField of dependencies) {
    const safeDepField = makeBrand(depField);

    // 1. Add to runtime dependency map for validity linking and inclusion
    const currentDeps = (runtimeDeps[fieldName] as string[]) || [];
    if (!currentDeps.includes(safeDepField as string)) {
      runtimeDeps[fieldName] = currentDeps.concat(safeDepField as string);
    }

    // 2. Register with IsolateTest payload for persistence (if available)
    if (isolate) {
      const currentPayloadDeps = VestTest.getData(isolate).dependsOn || [];
      if (!currentPayloadDeps.includes(safeDepField as string)) {
        VestTest.setData(isolate, current => ({
          ...current,
          dependsOn: currentPayloadDeps.concat(safeDepField as string),
        }));
      }
    }
  }
}
