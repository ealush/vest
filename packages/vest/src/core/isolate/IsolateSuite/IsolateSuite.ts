import { CB, assign } from 'vest-utils';
import { Isolate, IsolateInspector, TIsolate } from 'vestjs-runtime';

import { OptionalFieldDeclaration, OptionalFields } from 'OptionalTypes';
import { TFieldName } from 'SuiteResultTypes';
import { VestIsolateType } from 'VestIsolateType';

export type TIsolateSuite = TIsolate<{
  optional: OptionalFields;
}>;

export function IsolateSuite<Callback extends CB = CB>(
  callback: Callback
): TIsolateSuite {
  return Isolate.create(VestIsolateType.Suite, callback, {
    optional: {},
  });
}

export class SuiteOptionalFields {
  static setOptionalField(
    suite: TIsolateSuite,
    fieldName: TFieldName,
    setter: (current: OptionalFieldDeclaration) => OptionalFieldDeclaration
  ): void {
    const current = SuiteOptionalFields.getOptionalFields(suite);
    const currentField = current[fieldName];

    assign(current, {
      [fieldName]: assign({}, currentField, setter(currentField)),
    });
  }

  static getOptionalField(
    suite: TIsolateSuite,
    fieldName: TFieldName
  ): OptionalFieldDeclaration {
    const optional = SuiteOptionalFields.getOptionalFields(suite);
    return optional[fieldName] ?? {};
  }

  static getOptionalFields(suite: TIsolateSuite): OptionalFields {
    const { optional } = IsolateInspector.getData(suite);
    return optional;
  }
}
