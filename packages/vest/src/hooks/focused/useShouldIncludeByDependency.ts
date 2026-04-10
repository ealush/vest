import { VestRuntime } from 'vestjs-runtime';

import { useDependencies } from '../../core/Runtime';
import { TIsolateTest } from '../../core/isolate/IsolateTest/IsolateTest';
import { VestTest } from '../../core/isolate/IsolateTest/VestTest';
import { TestWalker } from '../../core/isolate/IsolateTest/TestWalker';
import { useHasFromRegistry } from '../../core/test/TestRegistry';
import matchingFieldName from '../../core/test/helpers/matchingFieldName';
import { useHasOnliedTests } from './useHasOnliedTests';

export function useShouldIncludeByDependency(
  fieldName: string,
  testObject: TIsolateTest,
): boolean {
  const dependencies = useDependencies();
  const queue = [fieldName];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (visited.has(current)) {
      continue;
    }
    visited.add(current);

    const fieldDependencies = dependencies[current];

    if (!fieldDependencies || fieldDependencies.length === 0) {
      continue;
    }

    if (!useIsFieldDirty(current)) {
      continue;
    }

    for (const dep of fieldDependencies) {
      // 1. If any dependency in the chain is explicitly focused, the whole chain is included.
      if (useHasOnliedTests(testObject, dep)) {
        return true;
      }
      // 2. Otherwise, check dependencies of this dependency (transitive)
      queue.push(dep);
    }
  }

  return false;
}

function useIsFieldDirty(fieldName: string): boolean {
  if (useHasFromRegistry('tested', fieldName)) {
    return true;
  }

  const [historyRoot] = VestRuntime.useHistoryRoot();

  return (
    !!historyRoot &&
    TestWalker.someTests(testObject => {
      return (
        matchingFieldName(VestTest.getData(testObject), fieldName).unwrap() &&
        VestTest.isTested(testObject).unwrap()
      );
    }, historyRoot)
  );
}
