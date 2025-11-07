import type { DropFirst } from 'vest-utils';

import { adaptDynamicRules } from './lazy/ruleAdapter';
import { typeRules } from './lazy/typeRules';

import { type RuleInstance } from 'RuleInstance';
import * as compoundRules from 'compoundRules';
import type { CompoundRuleLazyTypes } from 'compoundRules';
import { AnyRuleInstance } from 'generalRules';
import * as generalRules from 'generalRules';
import { ObjectRuleInstance } from 'objectRules';
import * as objectRules from 'objectRules';
import * as schemaRules from 'schemaRules';
import type { SchemaRuleLazyTypes } from 'schemaRules';
import { FirstParam } from 'typeUtils';

type TCustomLazyRules = {
  [K in keyof n4s.ValueFirstRules as K extends keyof SchemaRuleLazyTypes
    ? never
    : K extends keyof CompoundRuleLazyTypes
      ? never
      : K]: (
    ...args: DropFirst<
      Parameters<Extract<n4s.ValueFirstRules[K], (...args: any) => any>>
    >
  ) => RuleInstance<
    FirstParam<n4s.ValueFirstRules[K]>,
    [FirstParam<n4s.ValueFirstRules[K]>]
  >;
};

const baseEnforceLazy = {
  ...(adaptDynamicRules<RuleInstance<any, [any]>, typeof compoundRules>(
    compoundRules,
  ) as unknown as CompoundRuleLazyTypes),
  ...(adaptDynamicRules<RuleInstance<any, [any]>, typeof schemaRules>(
    schemaRules,
  ) as unknown as SchemaRuleLazyTypes),
  ...adaptDynamicRules<AnyRuleInstance, typeof generalRules>(generalRules),
  ...adaptDynamicRules<ObjectRuleInstance, typeof objectRules>(objectRules),
  ...typeRules,
};

export const enforceLazy = baseEnforceLazy as unknown as TCustomLazyRules &
  typeof baseEnforceLazy;
