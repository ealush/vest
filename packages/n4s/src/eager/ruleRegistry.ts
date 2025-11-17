import { assign } from 'vest-utils';

import { allRules, schemaRulesMap } from './allRules';

const customRules: Record<string, (...args: any[]) => any> = {};

export type UnmodifiedRuleKeys = keyof typeof allRules;
export type UnmodifiedRules = (typeof allRules)[UnmodifiedRuleKeys];
export type SchemaRuleKeys = keyof typeof schemaRulesMap;
export type SchemaRules = (typeof schemaRulesMap)[SchemaRuleKeys];

export function extendEager(rules: Record<string, (...args: any[]) => any>) {
  assign(customRules, rules);
}

export function getSchemaRule(ruleName: string): SchemaRules | null {
  return schemaRulesMap[ruleName as SchemaRuleKeys] ?? null;
}

export function getRule(ruleName: string): UnmodifiedRules | null {
  return (
    (customRules[ruleName] as UnmodifiedRules | undefined) ??
    allRules[ruleName as UnmodifiedRuleKeys]
  );
}
