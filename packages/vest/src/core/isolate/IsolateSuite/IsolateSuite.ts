import { Isolate } from 'Isolate';
import { OptionalFieldDeclaration, OptionalFields } from 'OptionalTypes';
import { TFieldName, TGroupName } from 'SuiteResultTypes';

export class IsolateSuite extends Isolate {
  optional: OptionalFields<TFieldName, TGroupName> = {} as OptionalFields<
    TFieldName,
    TGroupName
  >;

  setOptionalField(
    fieldName: TFieldName,
    setter: (
      current: OptionalFieldDeclaration<TFieldName, TGroupName>
    ) => OptionalFieldDeclaration<TFieldName, TGroupName>
  ): void {
    const current = this.optional;
    const currentField = current[fieldName];

    Object.assign(current, {
      [fieldName]: Object.assign({}, currentField, setter(currentField)),
    });
  }

  getOptionalField(
    fieldName: TFieldName
  ): OptionalFieldDeclaration<TFieldName, TGroupName> {
    return this.optional[fieldName] ?? {};
  }
}
