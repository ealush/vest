/** Opt-in suite.changed() support. */
import { validateRelationshipFields, resolveAffected } from 'n4s/relationships';
import {
  asArray,
  isFunction,
  isObject,
  isPromise,
  isStringValue,
  noop,
} from 'vest-utils';

import {
  installChangedHandler,
  type ChangedPlan,
} from '../suite/changedHandler';
import { ROOT_SCHEMA_FIELD } from '../suite/retainedSchemaFailures';
import {
  runSchemaWithParse,
  type SchemaRunResult,
} from '../suite/useCreateSuiteRunner';

// An empty changed selection runs no user test; an empty only() runs them all.
const NO_FIELD = '\0vest.changed.none';

installChangedHandler(planRelationshipRun);

function planRelationshipRun(
  schema: unknown,
  fields: readonly string[],
  data: unknown,
  modifiers: { only?: unknown; skip?: unknown },
): ChangedPlan {
  const selection = selectFields(schema, fields, data, modifiers);
  const { focus } = selection;
  const targets = { focus, only: focus.length ? focus : [NO_FIELD] };
  if (!schema) return { ...targets, schemaFocus: [], evaluated: null };
  if (!focus.length) {
    return {
      ...targets,
      schemaFocus: [],
      schemaResults: [],
      value: {},
      evaluated: () => false,
    };
  }
  const validation = validateRelationshipFields(
    schema,
    selection.schemaKeys,
    data,
  );
  if (!validation) return fullSchemaPlan(schema, data, targets, selection.skip);
  const { results, value, evaluatedKeys: checked } = validation;
  return {
    ...targets,
    schemaFocus: failurePaths(results, selection.skip),
    schemaResults: results,
    value,
    evaluated: path => isEvaluated(path, checked, selection.skip),
  };
}

type Selection = { focus: string[]; schemaKeys: string[]; skip: Set<string> };

function selectFields(
  schema: unknown,
  fields: readonly string[],
  data: unknown,
  modifiers: { only?: unknown; skip?: unknown },
): Selection {
  // The changed names always run, even when they are not schema paths.
  const names = fieldList(fields).filter(Boolean);
  const skip = new Set(fieldList(modifiers.skip).map(normalizeName));
  const focus = new Set<string>();
  const schemaKeys = new Set<string>();
  for (const path of affectedPaths(schema, names, data)) {
    const name = path.join('.');
    if (isSkipped(name, skip)) continue;
    focus.add(name);
    // Structured paths keep a literal dotted key whole.
    schemaKeys.add(String(path[0]));
  }
  for (const name of [...names, ...fieldList(modifiers.only)]) {
    if (isSkipped(name, skip)) continue;
    focus.add(name);
    schemaKeys.add(topLevelKey(name));
  }
  return { focus: [...focus], schemaKeys: [...schemaKeys], skip };
}

function affectedPaths(schema: unknown, names: string[], data: unknown) {
  return isN4sSchema(schema) ? resolveAffected(schema, names, data) : [];
}

function topLevelKey(field: string): string {
  return field.split(/[.[]/)[0];
}

function isSkipped(name: string, skip: Set<string>): boolean {
  if (skip.size === 0) return false;
  const normalized = normalizeName(name);
  return [...skip].some(
    field => normalized === field || normalized.startsWith(`${field}.`),
  );
}

function normalizeName(name: string): string {
  return name.replace(/\[(\d+)\]/g, '.$1');
}

function isEvaluated(
  path: readonly string[] | undefined,
  checked: ReadonlySet<string>,
  skip: Set<string>,
): boolean {
  return path === undefined
    ? checked.size > 0
    : checked.has(path[0]) && !isSkipped(path.join('.'), skip);
}

function fullSchemaPlan(
  schema: unknown,
  data: unknown,
  targets: Pick<ChangedPlan, 'focus' | 'only'>,
  skip: Set<string>,
): ChangedPlan {
  const executable = schema as { parse?: unknown; run?: unknown };
  if (!isFunction(executable.parse) && !isFunction(executable.run)) {
    throw new TypeError(
      'suite.changed() needs a synchronous schema with parse() or run()',
    );
  }
  const schemaResults = runSchemaWithParse(
    synchronousSchema(schema, executable),
    data,
    {},
  );
  const asyncResults = schemaResults.filter(result => isPromise(result.type));
  if (asyncResults.length) {
    asyncResults.forEach(
      result => void Promise.resolve(result.type).catch(noop),
    );
    throw new TypeError(
      'suite.changed() does not support asynchronous schema parsing',
    );
  }
  return {
    ...targets,
    schemaFocus: failurePaths(schemaResults, skip),
    schemaResults,
    evaluated: skip.size
      ? path => !isSkipped(path?.join('.') ?? ROOT_SCHEMA_FIELD, skip)
      : null,
  };
}

function synchronousSchema(
  schema: unknown,
  executable: { parse?: unknown; run?: unknown },
) {
  return isN4sSchema(schema)
    ? schema
    : {
        parse: synchronousMethod(schema, executable.parse),
        run: synchronousMethod(schema, executable.run),
      };
}

function synchronousMethod(receiver: unknown, method: unknown) {
  if (!isFunction(method)) return;
  return (data: unknown) => {
    const result = method.call(receiver, data);
    if (isPromise(result)) {
      void Promise.resolve(result).catch(noop);
      // Parse-validation TypeErrors trigger run() fallback. This setup error
      // must propagate before the runner can mistake a promise for parsed data.
      throw new Error(
        'suite.changed() does not support asynchronous schema parsing',
      );
    }
    return result;
  };
}

function failurePaths(results: SchemaRunResult[], skip: Set<string>): string[] {
  const paths = results
    .filter(result => !result.pass)
    .map(result => result.path?.join('.') ?? ROOT_SCHEMA_FIELD);
  return [...new Set(paths)].filter(path => !isSkipped(path, skip));
}

function isN4sSchema(value: unknown): value is object {
  if (!isObject(value) && !isFunction(value)) return false;
  return (
    (value as { '~standard'?: { vendor?: string } })['~standard']?.vendor ===
    'n4s'
  );
}

function fieldList(value: unknown): string[] {
  return value === undefined ? [] : asArray(value).filter(isStringValue);
}
