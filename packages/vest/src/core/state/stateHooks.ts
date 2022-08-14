import { cache as createCache, nestedArray, asArray, assign } from 'vest-utils';
import type { ValueOf } from 'vest-utils';

import VestTest from 'VestTest';
import type { StateKey, StateRef, StateValue, VestTests } from 'createStateRef';
import ctx from 'ctx';

// STATE REF
export function useStateRef(): Exclude<StateRef, void> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return ctx.useX().stateRef!; // I should revisit this
}

// STATE KEYS
export function useSuiteId(): StateValue<'suiteId'> {
  return useStateRef().suiteId()[0];
}
export function useSuiteName(): StateValue<'suiteName'> {
  return useStateRef().suiteName()[0];
}
export function useTestCallbacks(): StateKey<'testCallbacks'> {
  return useStateRef().testCallbacks();
}

// OPTIONAL FIELDS

export function useOptionalFields(): StateKey<'optionalFields'> {
  return useStateRef().optionalFields();
}

export function useSetOptionalField(
  fieldName: string,
  setter: (
    current: ValueOf<StateValue<'optionalFields'>>
  ) => Partial<ValueOf<StateValue<'optionalFields'>>>
) {
  const [, setOptionalFields] = useOptionalFields();

  setOptionalFields(prev =>
    assign(prev, {
      [fieldName]: assign({}, prev[fieldName], setter(prev[fieldName])),
    })
  );
}

export function useOptionalField(
  fieldName: string
): ValueOf<StateValue<'optionalFields'>> {
  const [optionalFields] = useOptionalFields();
  return optionalFields[fieldName] ?? {};
}

export function useTestObjects(): StateKey<'testObjects'> {
  return useStateRef().testObjects();
}

// STATE ACTIONS

export function useRefreshTestObjects(): void {
  useSetTests(tests => tests);
}

export function useSetTests(handler: (current: VestTests) => VestTests): void {
  const [, testObjects] = useTestObjects();

  testObjects(({ current, prev }) => ({
    prev,
    current: asArray(handler(current)),
  }));
}

// Derived state

export function useAllIncomplete(): VestTest[] {
  return useTestsFlat().filter(test => test.isPending());
}

const flatCache = createCache();
export function useTestsFlat(): VestTest[] {
  const [{ current }] = useTestObjects();

  return flatCache([current], () => nestedArray.flatten(current));
}

export function useEachTestObject(
  handler: (testObject: VestTest) => void
): void {
  const testObjects = useTestsFlat();

  testObjects.forEach(handler);
}
