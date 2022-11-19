// TODO: IMPLEMENT

import { hasAnyTests } from 'SuiteWalker';
import { hasErrorsByTestObjects } from 'hasFailuresByTestObjects';
import { isOptionalFiedApplied } from 'optional';

export function shouldAddValidProperty(fieldName: string): boolean {
  // Is the field optional, and the optional condition is applied
  if (isOptionalFiedApplied(fieldName)) {
    return true;
  }

  // const testObjects = useTestsFlat();

  // // Are there no tests?
  if (hasAnyTests()) {
    return false;
  }

  // // Does the field have any tests with errors?
  if (hasErrorsByTestObjects(fieldName)) {
    return false;
  }

  // // Does the given field have any pending tests that are not optional?
  // if (hasNonOptionalIncomplete(fieldName)) {
  //   return false;
  // }

  // // Does the field have no missing tests?
  // return noMissingTests(fieldName);

  return !!fieldName;
}

export function shouldAddValidPropertyInGroup(
  group: string,
  fieldName: string
): boolean {
  return !!group && !!fieldName;
}

// // Do the given group/field have any pending tests that are not optional?
// function hasNonOptionalIncompleteByGroup(groupName: string, fieldName: string) {
//   return isNotEmpty(
//     useAllIncomplete().filter(testObject => {
//       if (nonMatchingGroupName(testObject, groupName)) {
//         return false;
//       }

//       return isTestObjectOptional(testObject, fieldName);
//     })
//   );
// }
