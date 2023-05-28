import { Isolate } from 'vest-runtime';

import { OptionalFieldDeclaration, OptionalFields } from 'OptionalTypes';
import { TFieldName } from 'SuiteResultTypes';

export class IsolateSuite extends Isolate {
  optional: OptionalFields = {};

  setOptionalField(
    fieldName: TFieldName,
    setter: (current: OptionalFieldDeclaration) => OptionalFieldDeclaration
  ): void {
    const current = this.optional;
    const currentField = current[fieldName];

    Object.assign(current, {
      [fieldName]: Object.assign({}, currentField, setter(currentField)),
    });
  }

  getOptionalField(fieldName: TFieldName): OptionalFieldDeclaration {
    return this.optional[fieldName] ?? {};
  }

  getOptionalFields(): OptionalFields {
    return this.optional;
  }
}
