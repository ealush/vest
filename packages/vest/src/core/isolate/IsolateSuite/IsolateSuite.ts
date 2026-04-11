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
  dependencies: Record<TFieldName, Set<TFieldName>>;
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

export function IsolateSuite<Callback extends CB = CB>(
  callback: Callback,
  resolver: CB<SuiteResult<TFieldName, TGroupName, any>>,
): TIsolateSuite {
  return createVestIsolate(VestIsolateType.Suite, callback, {
    dependencies: {},
    optional: {},
    resolver,
  });
}

export class SuiteDependencies {
  static addDependency(
    suite: TIsolateSuite,
    fieldName: TFieldName,
    dependency: TFieldName,
  ): void {
    const dependencies = suite.data.dependencies;
    dependencies[fieldName] = dependencies[fieldName] ?? new Set<TFieldName>();
    dependencies[fieldName].add(dependency);
  }

  static getDependencies(
    suite: TIsolateSuite,
  ): Record<TFieldName, TFieldName[]> {
    const source = suite.data.dependencies ?? {};
    const output: Record<TFieldName, TFieldName[]> = {};

    Object.keys(source).forEach(key => {
      output[key as TFieldName] = Array.from(source[key as TFieldName] ?? []);
    });

    return output;
  }
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
