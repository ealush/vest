import { CB, assign } from 'vest-utils';
import { RegistryIndex } from 'vestjs-runtime';

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
  /**
   * Last successful full callback value. Root ownership makes it follow the
   * same reset, replacement, serialization, and hydration lifecycle as tests.
   */
  mappedSchemaOutput?: MappedSchemaOutput;
  optional: OptionalFields;
  resolver: CB<SuiteResult<TFieldName, TGroupName, any>>;
  // Registry indices (populated by IsolateRegistry)
  registry_all?: RegistryIndex;
  registry_failed?: RegistryIndex;
  registry_omitted?: RegistryIndex;
  registry_passing?: RegistryIndex;
  registry_pending?: RegistryIndex;
  registry_tested?: RegistryIndex;
  registry_valid?: RegistryIndex;
  registry_warning?: RegistryIndex;
}>;

export type MappedSchemaOutput = {
  hasValue: true;
  value: unknown;
};

export function IsolateSuite<Callback extends CB = CB>(
  callback: Callback,
  resolver: CB<SuiteResult<TFieldName, TGroupName, any>>,
  mappedSchemaOutput?: MappedSchemaOutput,
): TIsolateSuite {
  return createVestIsolate(VestIsolateType.Suite, callback, {
    ...(mappedSchemaOutput === undefined ? {} : { mappedSchemaOutput }),
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
    return (
      SuiteOptionalFields.getOptionalFields(suite)[fieldName] ??
      ({} as OptionalFieldDeclaration)
    );
  }

  static getOptionalFields(suite: TIsolateSuite): OptionalFields {
    return suite.data?.optional ?? {};
  }
}
