import { assign } from 'vest-utils';
import { Isolate } from 'vestjs-runtime';

import { OptionalFieldDeclaration, OptionalFields } from 'OptionalTypes';
import { TFieldName } from 'SuiteResultTypes';
import { VestIsolateType } from 'VestIsolateType';

export class IsolateSuite extends Isolate {
  type = VestIsolateType.Suite;
  optional: OptionalFields = {};

  setOptionalField(
    fieldName: TFieldName,
    setter: (current: OptionalFieldDeclaration) => OptionalFieldDeclaration
  ): void {
    const current = this.optional;
    const currentField = current[fieldName];

    assign(current, {
      [fieldName]: assign({}, currentField, setter(currentField)),
    });
  }

  getOptionalField(fieldName: TFieldName): OptionalFieldDeclaration {
    return this.optional[fieldName] ?? {};
  }

  getOptionalFields(): OptionalFields {
    return this.optional;
  }
}
