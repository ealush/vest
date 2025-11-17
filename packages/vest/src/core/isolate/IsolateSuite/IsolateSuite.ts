import { CB, assign } from 'vest-utils';

import {
  OptionalFieldDeclaration,
  OptionalFields,
} from '../../../hooks/optional/OptionalTypes';
import {
  SuiteResult,
  TFieldName,
  TGroupName,
} from '../../../suiteResult/SuiteResultTypes';
import {
  createVestIsolate,
  TVestIsolate,
  VestIsolateType,
} from '../VestIsolateType';

export type TIsolateSuite = TVestIsolate<{
  optional: OptionalFields;
  resolver: CB<SuiteResult<TFieldName, TGroupName>>;
}>;

export function IsolateSuite<Callback extends CB = CB>(
  callback: Callback,
  resolver: CB<SuiteResult<TFieldName, TGroupName>>,
): TIsolateSuite {
  return createVestIsolate(VestIsolateType.Suite, callback, {
    optional: {},
    resolver,
  });
}

export class SuiteOptionalFields {
  static setOptionalField(
    suite: TIsolateSuite,
    fieldName: TFieldName,
    setter: (current: OptionalFieldDeclaration) => OptionalFieldDeclaration,
  ): void {
    const current = suite.data.optional;
    const currentField = current[fieldName];

    assign(current, {
      [fieldName]: assign({}, currentField, setter(currentField)),
    });
  }

  static getOptionalField(
    suite: TIsolateSuite,
    fieldName: TFieldName,
  ): OptionalFieldDeclaration {
    return SuiteOptionalFields.getOptionalFields(suite)[fieldName] ?? {};
  }

  static getOptionalFields(suite: TIsolateSuite): OptionalFields {
    return suite.data?.optional ?? {};
  }
}
