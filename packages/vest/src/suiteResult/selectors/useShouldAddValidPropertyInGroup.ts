import { TFieldName, TGroupName } from '../SuiteResultTypes';

import { useSetValidPropertyImpl } from './useSetValidProperty';

export function useShouldAddValidPropertyInGroup(
  groupName: TGroupName,
  fieldName: TFieldName,
): boolean {
  // Use shared implementation with groupName to scope all checks to this group
  return useSetValidPropertyImpl(fieldName, groupName);
}
