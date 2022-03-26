import { LazyRuleRunners } from 'genEnforceLazy';

export interface ShapeObject
  extends Record<string, any>,
    Record<string, LazyRuleRunners> {}
