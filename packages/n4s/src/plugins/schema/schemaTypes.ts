import { LazyRuleRunners } from '@/runtime/genEnforceLazy';

export interface ShapeObject
  extends Record<string, any>,
    Record<string, LazyRuleRunners> {}
