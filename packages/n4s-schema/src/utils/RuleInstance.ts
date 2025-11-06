import { RuleRunReturn } from 'RuleRunReturn';

export class RuleInstance<T, Args extends any[] = any[]> {
  // The runtime object produced by create() supports dynamic chaining.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;

  // Type-only property for inference of rule return type
  // (not used at runtime, assigned in create())
  infer!: T;

  // Type-only declaration for the run function shape
  run!: (...args: Args) => RuleRunReturn<T>;

  private constructor() {}

  static create<R extends RuleInstance<T, Args>, T, Args extends any[]>(
    rule: (...args: Args) => RuleRunReturn<T>,
  ): R {
    return {
      run: (...args: Args) => rule(...args),
      infer: {} as T,
    } as R;
  }
}
