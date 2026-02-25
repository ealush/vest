import { CB } from 'vest-utils';
import { StandardSchemaV1 } from 'vest-utils/standardSchemaSpec';

import { Subscribe } from '../core/VestBus/VestBus';
import { TIsolateSuite } from '../core/isolate/IsolateSuite/IsolateSuite';
import { FieldExclusion } from '../hooks/focused/focused';
import {
  SuiteResult,
  TFieldName,
  TGroupName,
  InferSchemaData,
  InferSchemaOutput,
  TSchema,
} from '../suiteResult/SuiteResultTypes';
import { SuiteSelectors } from '../suiteResult/selectors/suiteSelectors';

import { TTypedMethods } from './getTypedMethods';

export type SuiteCallbackWithSchema<
  S extends TSchema,
  T extends CB,
> = S extends undefined
  ? T
  : (data: InferSchemaOutput<S>, ...args: any[]) => void;

export type Suite<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB = CB,
  S extends TSchema = undefined,
> = SuiteMethods<F, G, T, S> &
  StandardSchemaV1<InferSchemaData<S>, InferSchemaOutput<S>>;

type SuiteMethods<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB,
  S extends TSchema,
> = {
  dump: CB<TIsolateSuite>;

  get: CB<SuiteResult<F, G, S>>;
  resume: CB<void, [TIsolateSuite]>;
  reset: CB<void>;
  remove: CB<void, [fieldName: F | string]>;
  resetField: CB<void, [fieldName: F | string]>;
  run: (
    ...args: S extends undefined
      ? Parameters<T>
      : [data: InferSchemaData<S>, ...args: any[]]
  ) => SuiteResult<F, G>;
  runStatic: (
    ...args: S extends undefined
      ? Parameters<T>
      : [data: InferSchemaData<S>, ...args: any[]]
  ) => SuiteResult<F, G>;
  validate: (
    ...args: S extends undefined
      ? Parameters<T>
      : [data: InferSchemaData<S>, ...args: any[]]
  ) => SuiteResult<F, G>;
  subscribe: Subscribe;
} & AfterMethods<F, G, T, S> &
  TTypedMethods<F, G> &
  SuiteSelectors<F, G>;

type FocusedMethods<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB,
  S extends TSchema,
> = {
  afterEach: CB<FocusedMethods<F, G, T, S>, [callback: CB]>;
  afterField: CB<
    FocusedMethods<F, G, T, S>,
    [fieldName: F | string, callback: CB]
  >;
  focus: CB<FocusedMethods<F, G, T, S>, [config: SuiteModifiers<F>]>;
  only: CB<
    FocusedMethods<F, G, T, S>,
    [onlyField: FieldExclusion<F> | FieldExclusion<string>]
  >;
  // run is included but runStatic is intentionally omitted: runStatic is stateless
  // and does not carry focus modifiers, so it is not part of the focused API surface.
  run: (
    ...args: S extends undefined
      ? Parameters<T>
      : [data: Partial<InferSchemaData<S>>, ...args: any[]]
  ) => SuiteResult<F, G>;
};

type AfterMethods<
  F extends TFieldName,
  G extends TGroupName,
  T extends CB,
  S extends TSchema,
> = {
  afterEach: CB<AfterMethods<F, G, T, S>, [callback: CB]>;
  afterField: CB<
    AfterMethods<F, G, T, S>,
    [fieldName: F | string, callback: CB]
  >;
  focus: CB<FocusedMethods<F, G, T, S>, [config: SuiteModifiers<F>]>;
  only: CB<
    FocusedMethods<F, G, T, S>,
    [onlyField: FieldExclusion<F> | FieldExclusion<string>]
  >;
  run: (
    ...args: S extends undefined
      ? Parameters<T>
      : [data: InferSchemaData<S>, ...args: any[]]
  ) => SuiteResult<F, G>;
};

/**
 * Modifiers that control which fields and groups are included or excluded
 * during a focused suite run. These can be provided either via
 * `suite.focus(modifiers)` or via shorthand methods:
 *   - `suite.only(field)` is a shortcut for `suite.focus({ only: field })`
 *
 * - `only` — Run only the specified field(s). All others are excluded unless
 *   explicitly included via `include()`.
 * - `skip` — Skip the specified field(s). All others run as usual.
 * - `skipGroup` — Skip all tests inside the named group(s). Tests outside the
 *   matched groups are unaffected.
 * - `onlyGroup` — Run only tests inside the named group(s). Top-level tests
 *   outside any group are also excluded.
 */
export type SuiteModifiers<F extends TFieldName> = {
  only?: FieldExclusion<F> | FieldExclusion<string>;
  onlyGroup?: string | string[];
  skip?: FieldExclusion<F> | FieldExclusion<string>;
  skipGroup?: string | string[];
};
