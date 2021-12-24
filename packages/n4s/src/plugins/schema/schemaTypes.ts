import { TLazyRuleRunners } from 'genEnforceLazy';

export interface IShapeObject
  extends Record<string, any>,
    Record<string, TLazyRuleRunners> {}
