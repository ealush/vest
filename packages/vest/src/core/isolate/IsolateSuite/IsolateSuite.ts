import { CB, assign } from 'vest-utils';
import { Isolate, TIsolate } from 'vestjs-runtime';

import { OptionalFieldDeclaration, OptionalFields } from 'OptionalTypes';
import {
  SuiteResult,
  SuiteSummary,
  TFieldName,
  TGroupName,
} from 'SuiteResultTypes';
import { VestIsolateType } from 'VestIsolateType';

export type TIsolateSuite = TIsolate<{
  optional: OptionalFields;
  resolver: CB<SuiteResult<TFieldName, TGroupName>>;
  summary: SuiteSummary<TFieldName, TGroupName>;
}>;

export function IsolateSuite<Callback extends CB = CB>(
  callback: Callback,
  resolver: CB<SuiteResult<TFieldName, TGroupName>>,
): TIsolateSuite {
  return Isolate.create(VestIsolateType.Suite, callback, {
    optional: {},
    resolver,
    summary: new SuiteSummary(),
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
