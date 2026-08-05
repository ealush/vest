import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import type {
  FieldError,
  FieldValues,
  Resolver,
  ResolverOptions,
  ResolverResult,
} from 'react-hook-form';
import type { Suite } from 'vest';

type AnyVestSuite = Suite<
  any,
  any,
  (...args: any[]) => void,
  StandardSchemaV1<any, any>
>;

type SuiteInput<SuiteType extends AnyVestSuite> =
  StandardSchemaV1.InferInput<SuiteType> extends FieldValues
    ? StandardSchemaV1.InferInput<SuiteType>
    : never;

type SuiteOutput<SuiteType extends AnyVestSuite> =
  StandardSchemaV1.InferOutput<SuiteType>;

type ResolverSchema<SuiteType extends AnyVestSuite> = StandardSchemaV1<
  SuiteInput<SuiteType>,
  SuiteOutput<SuiteType>
>;

type AnySuiteResult = ReturnType<AnyVestSuite['get']>;

type RunRequest = {
  context: unknown;
  focusedNames: readonly string[] | undefined;
  values: FieldValues;
};

type ResolverResultRequest<Input extends FieldValues, Output> = {
  focusedNames: readonly string[] | undefined;
  options: ResolverOptions<Input>;
  outputSchema: StandardSchemaV1<Input, Output>;
  resolverOptions: VestResolverOptions;
  result: AnySuiteResult;
  values: Input;
};

type FlatIssue = {
  message: string;
  path: string;
  type: string;
};

export type VestResolverOptions<SuiteType extends AnyVestSuite = AnyVestSuite> =
  {
    mode?: 'async' | 'sync';
    raw?: boolean;
    suiteFactory: () => SuiteType;
  };

export function vestResolver<SuiteType extends AnyVestSuite, Context = unknown>(
  suite: SuiteType,
  outputSchema: ResolverSchema<SuiteType>,
  resolverOptions: VestResolverOptions<SuiteType> & { raw?: false },
): Resolver<SuiteInput<SuiteType>, Context, SuiteOutput<SuiteType>>;
export function vestResolver<SuiteType extends AnyVestSuite, Context = unknown>(
  suite: SuiteType,
  outputSchema: ResolverSchema<SuiteType>,
  resolverOptions: VestResolverOptions<SuiteType> & { raw: true },
): Resolver<SuiteInput<SuiteType>, Context, SuiteInput<SuiteType>>;
export function vestResolver<SuiteType extends AnyVestSuite, Context = unknown>(
  suite: SuiteType,
  outputSchema: ResolverSchema<SuiteType>,
  resolverOptions: VestResolverOptions<SuiteType>,
): Resolver<
  SuiteInput<SuiteType>,
  Context,
  SuiteInput<SuiteType> | SuiteOutput<SuiteType>
> {
  return (values, context, options) => {
    const focusedNames = getFocusedNames(values, options);
    const runRequest = { context, focusedNames, values };

    if (resolverOptions.mode === 'sync') {
      const result = runSuite(suite, resolverOptions.suiteFactory, runRequest);
      if (hasPendingFields(result, focusedNames)) {
        throw new Error(
          'Vest resolver mode is sync, but the suite started asynchronous validation.',
        );
      }
      const resolverResult = toResolverResult({
        focusedNames,
        options,
        outputSchema,
        resolverOptions,
        result,
        values,
      });
      if (isPromiseLike(resolverResult)) {
        throw new Error(
          'Vest resolver mode is sync, but the output schema returned a Promise.',
        );
      }
      return resolverResult;
    }

    return waitForRelevantResult(
      suite,
      resolverOptions.suiteFactory,
      runRequest,
    ).then(result =>
      toResolverResult({
        focusedNames,
        options,
        outputSchema,
        resolverOptions,
        result,
        values,
      }),
    );
  };
}

function runSuite(
  suite: AnyVestSuite,
  suiteFactory: () => AnyVestSuite,
  request: RunRequest,
): AnySuiteResult {
  return runSuiteInstance(selectSuite(suite, suiteFactory, request), request);
}

function waitForRelevantResult(
  suite: AnyVestSuite,
  suiteFactory: () => AnyVestSuite,
  request: RunRequest,
): Promise<AnySuiteResult> {
  const selectedSuite = selectSuite(suite, suiteFactory, request);

  return new Promise((resolve, reject) => {
    let started = false;
    let settled = false;
    const unsubscribe = selectedSuite.subscribe(() => {
      Promise.resolve().then(checkCurrentResult);
    });

    try {
      const result = runSuiteInstance(selectedSuite, request);
      started = true;
      settleIfComplete(result);
    } catch (error) {
      settled = true;
      unsubscribe();
      reject(error);
    }

    function checkCurrentResult() {
      if (!started || settled) return;
      settleIfComplete(selectedSuite.get());
    }

    function settleIfComplete(result: AnySuiteResult) {
      if (settled || hasPendingFields(result, request.focusedNames)) return;
      settled = true;
      unsubscribe();
      resolve(result);
    }
  });
}

function selectSuite(
  suite: AnyVestSuite,
  suiteFactory: () => AnyVestSuite,
  request: RunRequest,
): AnyVestSuite {
  return request.focusedNames?.length ? suite : suiteFactory();
}

function runSuiteInstance(
  suite: AnyVestSuite,
  request: RunRequest,
): AnySuiteResult {
  if (!request.focusedNames?.length) {
    return suite.run(request.values, request.context);
  }

  removeMissingFields(suite, request.values);
  return suite
    .only([...request.focusedNames])
    .run(request.values, request.context);
}

function hasPendingFields(
  result: AnySuiteResult,
  focusedNames: readonly string[] | undefined,
): boolean {
  return focusedNames?.length
    ? focusedNames.some(name => result.isPending(name))
    : result.isPending();
}

function toResolverResult<Input extends FieldValues, Output>(
  request: ResolverResultRequest<Input, Output>,
): ResolverResult<Input, Output> | Promise<ResolverResult<Input, Output>> {
  const validateAllFieldCriteria =
    !request.options.shouldUseNativeValidation &&
    request.options.criteriaMode === 'all';
  const flatErrors = parseVestErrors(
    request.result.errors,
    validateAllFieldCriteria,
  );

  if (Object.keys(flatErrors).length) {
    return toFailureResult(flatErrors, request.options);
  }

  return toSuccessfulResolverResult(request, validateAllFieldCriteria);
}

function toSuccessfulResolverResult<Input extends FieldValues, Output>(
  request: ResolverResultRequest<Input, Output>,
  validateAllFieldCriteria: boolean,
): ResolverResult<Input, Output> | Promise<ResolverResult<Input, Output>> {
  if (request.focusedNames?.length && !request.resolverOptions.raw) {
    return validateOutputSchema(request, validateAllFieldCriteria);
  }

  clearNativeErrors(request.options);
  return {
    errors: {},
    values: getResolverValue<Input, Output>(
      request.result,
      request.values,
      request.resolverOptions.raw === true,
    ),
  };
}

function validateOutputSchema<Input extends FieldValues, Output>(
  request: ResolverResultRequest<Input, Output>,
  validateAllFieldCriteria: boolean,
): ResolverResult<Input, Output> | Promise<ResolverResult<Input, Output>> {
  const schemaResult = request.outputSchema['~standard'].validate(
    request.values,
  );
  if (isPromiseLike(schemaResult)) {
    return Promise.resolve(schemaResult).then(completedResult =>
      toFocusedSchemaResolverResult(
        completedResult,
        request,
        validateAllFieldCriteria,
      ),
    );
  }
  return toFocusedSchemaResolverResult(
    schemaResult,
    request,
    validateAllFieldCriteria,
  );
}

function toFocusedSchemaResolverResult<Input extends FieldValues, Output>(
  schemaResult: StandardSchemaV1.Result<Output>,
  request: ResolverResultRequest<Input, Output>,
  validateAllFieldCriteria: boolean,
): ResolverResult<Input, Output> {
  if (schemaResult.issues) {
    const focusedIssues = schemaResult.issues.filter(issue =>
      isFocusedIssue(issue, request.focusedNames ?? []),
    );
    if (focusedIssues.length) {
      return toFailureResult(
        parseStandardSchemaIssues(focusedIssues, validateAllFieldCriteria),
        request.options,
      );
    }

    clearNativeErrors(request.options);
    return { errors: {}, values: request.values as unknown as Output };
  }

  clearNativeErrors(request.options);
  return { errors: {}, values: schemaResult.value };
}

function isFocusedIssue(
  issue: StandardSchemaV1.Issue,
  focusedNames: readonly string[],
): boolean {
  const path = standardSchemaPath(issue.path);
  if (path === '__root__') return true;

  return focusedNames.some(
    name =>
      path === name ||
      path.startsWith(`${name}.`) ||
      name.startsWith(`${path}.`),
  );
}

function toFailureResult<Input extends FieldValues>(
  flatErrors: Record<string, FieldError>,
  options: ResolverOptions<Input>,
): ResolverResult<Input, never> {
  return {
    errors: toNestErrors(flatErrors, options),
    values: {},
  };
}

function clearNativeErrors<Input extends FieldValues>(
  options: ResolverOptions<Input>,
): void {
  if (options.shouldUseNativeValidation) {
    validateFieldsNatively({}, options);
  }
}

function parseVestErrors(
  issues: AnySuiteResult['errors'],
  validateAllFieldCriteria: boolean,
): Record<string, FieldError> {
  const errors = Object.create(null) as Record<string, FieldError>;

  for (const issue of issues) {
    const path = issue.fieldName;
    if (!path) continue;

    const message =
      typeof issue.message === 'string' ? issue.message : 'Validation failed';
    addFieldError(
      errors,
      { message, path, type: 'vest' },
      validateAllFieldCriteria,
    );
  }

  return errors;
}

function parseStandardSchemaIssues(
  issues: ReadonlyArray<StandardSchemaV1.Issue>,
  validateAllFieldCriteria: boolean,
): Record<string, FieldError> {
  const errors = Object.create(null) as Record<string, FieldError>;

  for (const issue of issues) {
    addFieldError(
      errors,
      {
        message: issue.message,
        path: standardSchemaPath(issue.path),
        type: 'schema',
      },
      validateAllFieldCriteria,
    );
  }

  return errors;
}

function addFieldError(
  errors: Record<string, FieldError>,
  issue: FlatIssue,
  validateAllFieldCriteria: boolean,
): void {
  if (!errors[issue.path]) {
    errors[issue.path] = { message: issue.message, type: issue.type };
  }

  if (validateAllFieldCriteria) {
    const types = errors[issue.path].types ?? {};
    errors[issue.path].types = {
      ...types,
      [Object.keys(types).length]: issue.message,
    };
  }
}

function standardSchemaPath(path: StandardSchemaV1.Issue['path']): string {
  if (!path?.length) return '__root__';

  return path
    .map(segment =>
      typeof segment === 'object' && segment !== null && 'key' in segment
        ? String(segment.key)
        : String(segment),
    )
    .join('.');
}

function getResolverValue<Input extends FieldValues, Output>(
  result: AnySuiteResult,
  values: Input,
  raw: boolean,
): Output {
  if (raw) return Object.assign({}, values) as Output;

  const parsed =
    'value' in result && result.value !== undefined
      ? result.value
      : result.run.data.parsed;

  if (parsed === undefined) return values as unknown as Output;
  return parsed;
}

function isPromiseLike<T>(value: unknown): value is PromiseLike<T> {
  return (
    (typeof value === 'object' || typeof value === 'function') &&
    value !== null &&
    'then' in value &&
    typeof value.then === 'function'
  );
}

function getFocusedNames<Input extends FieldValues>(
  values: Input,
  options: ResolverOptions<Input>,
): readonly string[] | undefined {
  const names = options.names?.map(String);
  if (!names?.length) return undefined;

  const leafPaths = collectLeafPaths(values);
  const coversWholeValue = leafPaths.every(path =>
    names.some(name => path === name || path.startsWith(`${name}.`)),
  );

  if (coversWholeValue) return undefined;

  return [
    ...new Set(
      names.flatMap(name => {
        const matchingLeaves = leafPaths.filter(
          path => path === name || path.startsWith(`${name}.`),
        );

        return matchingLeaves.length ? matchingLeaves : name;
      }),
    ),
  ];
}

function collectLeafPaths(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      collectLeafPaths(item, prefix ? `${prefix}.${index}` : String(index)),
    );
  }

  if (isRecord(value)) {
    return Object.entries(value).flatMap(([key, item]) =>
      collectLeafPaths(item, prefix ? `${prefix}.${key}` : key),
    );
  }

  return prefix ? [prefix] : [];
}

function removeMissingFields(suite: AnyVestSuite, values: FieldValues): void {
  for (const fieldName of Object.keys(suite.get().tests)) {
    if (!hasValueAtPath(values, fieldName)) {
      suite.remove(fieldName);
    }
  }
}

function hasValueAtPath(value: unknown, path: string): boolean {
  let current = value;

  for (const segment of path.split('.')) {
    const lookup = readPathSegment(current, segment);
    if (!lookup.found) return false;
    current = lookup.value;
  }

  return true;
}

type PathLookup = { found: false } | { found: true; value: unknown };

function readPathSegment(value: unknown, segment: string): PathLookup {
  if (Array.isArray(value)) {
    const index = Number(segment);
    if (!isArrayIndex(value, index)) return { found: false };
    return { found: true, value: value[index] };
  }

  if (!isRecord(value)) return { found: false };
  if (!Object.hasOwn(value, segment)) return { found: false };
  return { found: true, value: value[segment] };
}

function isArrayIndex(value: readonly unknown[], index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < value.length;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
