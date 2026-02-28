import React, { useRef, useEffect, useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import commonStyles from '../RawExample.module.css';

const vestDts = `
declare module 'vest' {
  type TestFn = () => void | boolean | Promise<void>;
  type FieldExclusion<F extends string> = F | F[] | undefined;
  type OptionalsInput<F extends string> = F | F[] | Partial<Record<F, any>>;

  type SuiteConfig = { fields: string; groups?: string };

  interface SuiteModifiers<F extends string, G extends string = string> {
    only?: FieldExclusion<F>;
    onlyGroup?: G | G[];
    skip?: FieldExclusion<F>;
    skipGroup?: G | G[];
  }

  interface SuiteSelectors<F extends string, G extends string = string> {
    hasErrors(fieldName?: F): boolean;
    hasWarnings(fieldName?: F): boolean;
    getErrors(): Record<string, string[]>;
    getErrors(fieldName: F): string[];
    getWarnings(): Record<string, string[]>;
    getWarnings(fieldName: F): string[];
    getError(): { fieldName: F; message?: string } | undefined;
    getError(fieldName: F): string | undefined;
    getWarning(): { fieldName: F; message?: string } | undefined;
    getWarning(fieldName: F): string | undefined;
    getMessage(fieldName: F): string | undefined;
    isValid(fieldName?: F): boolean;
    isTested(fieldName: F): boolean;
    isPending(fieldName?: F): boolean;
    hasErrorsByGroup(groupName: G, fieldName?: F): boolean;
    hasWarningsByGroup(groupName: G, fieldName?: F): boolean;
    getErrorsByGroup(groupName: G): Record<string, string[]>;
    getErrorsByGroup(groupName: G, fieldName: F): string[];
    getWarningsByGroup(groupName: G): Record<string, string[]>;
    getWarningsByGroup(groupName: G, fieldName: F): string[];
    isValidByGroup(groupName: G, fieldName?: F): boolean;
  }

  interface SuiteResult<F extends string = string, G extends string = string>
    extends SuiteSelectors<F, G> {
    errorCount: number;
    warnCount: number;
    testCount: number;
    pendingCount: number;
    valid: boolean | null;
    tests: Record<string, { errorCount: number; warnCount: number; errors: string[]; warnings: string[]; valid: boolean | null }>;
  }

  interface FocusedSuite<F extends string, G extends string, T, S> {
    afterEach(callback: () => void): FocusedSuite<F, G, T, S>;
    afterField(fieldName: F, callback: () => void): FocusedSuite<F, G, T, S>;
    focus(config: SuiteModifiers<F, G>): FocusedSuite<F, G, T, S>;
    only(onlyField: FieldExclusion<F>): FocusedSuite<F, G, T, S>;
    run(...args: any[]): SuiteResult<F, G>;
  }

  interface Suite<F extends string, G extends string, T = any, S = undefined> {
    get(): SuiteResult<F, G>;
    reset(): void;
    remove(fieldName: F): void;
    resetField(fieldName: F): void;
    run(...args: any[]): SuiteResult<F, G>;
    runStatic(...args: any[]): SuiteResult<F, G>;
    subscribe(callback: () => void): () => void;

    // After/focus methods
    afterEach(callback: () => void): Suite<F, G, T, S>;
    afterField(fieldName: F, callback: () => void): Suite<F, G, T, S>;
    focus(config: SuiteModifiers<F, G>): FocusedSuite<F, G, T, S>;
    only(onlyField: FieldExclusion<F>): FocusedSuite<F, G, T, S>;

    // Typed callback methods (destructurable)
    test: {
      (fieldName: F, message: string, cb: TestFn): any;
      (fieldName: F, cb: TestFn): any;
    };
    group: {
      (callback: () => void): any;
      (groupName: G, callback: () => void): any;
    };
    skip(item: FieldExclusion<F>): void;
    include(fieldName: F): { when(condition: any): void };
    optional(optionals: OptionalsInput<F>): void;
    omitWhen(conditional: any, callback: () => void): void;
    skipWhen(condition: any, callback: () => void): void;

    // Selectors (also on suite directly)
    hasErrors(fieldName?: F): boolean;
    hasWarnings(fieldName?: F): boolean;
    getErrors(): Record<string, string[]>;
    getErrors(fieldName: F): string[];
    getWarnings(): Record<string, string[]>;
    getWarnings(fieldName: F): string[];
    isValid(fieldName?: F): boolean;
    isTested(fieldName: F): boolean;
  }

  // --- enforce ---

  interface RuleInstance<T = any> {
    test(value: any): boolean;
    run(value: any): { pass: boolean; type: T };
    message(msg: string): RuleInstance<T>;
  }

  interface ShapeSchema<T extends Record<string, any>> extends RuleInstance<T> {}

  interface EnforceChain<T = any> {
    isString(): EnforceChain<T>;
    isNumber(): EnforceChain<T>;
    isBoolean(): EnforceChain<T>;
    isArray(): EnforceChain<T>;
    isNotBlank(): EnforceChain<T>;
    isNotEmpty(): EnforceChain<T>;
    longerThan(length: number): EnforceChain<T>;
    shorterThan(length: number): EnforceChain<T>;
    greaterThan(value: number): EnforceChain<T>;
    lessThan(value: number): EnforceChain<T>;
    equals(value: any): EnforceChain<T>;
    inside(list: any[]): EnforceChain<T>;
    matches(pattern: RegExp | string): EnforceChain<T>;
  }

  interface EnforceLazy {
    isString(): RuleInstance<string>;
    isNumber(): RuleInstance<number>;
    isBoolean(): RuleInstance<boolean>;
    isArray(): RuleInstance<any[]>;
    isArrayOf<R>(rule: RuleInstance<R>): RuleInstance<R[]>;
    optional<R>(rule: RuleInstance<R>): RuleInstance<R | undefined>;

    shape<S extends Record<string, RuleInstance<any>>>(
      schema: S
    ): ShapeSchema<{ [K in keyof S]: S[K] extends RuleInstance<infer T> ? T : any }>;

    loose<S extends Record<string, RuleInstance<any>>>(
      schema: S
    ): ShapeSchema<{ [K in keyof S]: S[K] extends RuleInstance<infer T> ? T : any }>;

    partial<S extends Record<string, RuleInstance<any>>>(
      schema: S
    ): ShapeSchema<{ [K in keyof S]?: S[K] extends RuleInstance<infer T> ? T | undefined : any }>;
  }

  type Enforce = ((value: any) => EnforceChain) & EnforceLazy & { extend(rules: Record<string, Function>): void };
  export const enforce: Enforce;

  // --- create overloads ---

  // Config generic: explicit field/group names
  export function create<C extends SuiteConfig>(
    suiteCallback: (...args: any[]) => void,
  ): Suite<C['fields'], C['groups'] extends string ? C['groups'] : string>;

  // Schema-based: infer fields from enforce.shape
  export function create<S extends ShapeSchema<any>>(
    suiteCallback: (data: S extends ShapeSchema<infer T> ? T : any, ...args: any[]) => void,
    schema: S,
  ): Suite<
    S extends ShapeSchema<infer T> ? Extract<keyof T, string> : string,
    string,
    any,
    S
  >;

  // Untyped fallback
  export function create(
    suiteCallback: (...args: any[]) => void,
  ): Suite<string, string>;

  // --- other exports ---
  export function test(fieldName: string, message: string, cb: TestFn): any;
  export function test(fieldName: string, cb: TestFn): any;
  export function group(callback: () => void): any;
  export function group(groupName: string, callback: () => void): any;
  export function only(item: string | string[]): void;
  export function skip(item: string | string[]): void;
  export function include(fieldName: string): { when(condition: any): void };
  export function optional(optionals: string | string[] | Record<string, any>): void;
  export function warn(): void;
}
`;

const SchemaSuiteCode = `import { create, enforce } from 'vest';

// Define a schema — field names and data types
// are inferred automatically.
const userSchema = enforce.shape({
  username: enforce.isString(),
  email: enforce.isString(),
  age: enforce.isNumber(),
});

const suite = create(data => {
  // \`data\` is typed as:
  // { username: string; email: string; age: number }

  // Destructure typed helpers from the suite:
  const { test, only, skip, optional } = suite;

  test('username', 'Username is required', () => {
    enforce(data.username).isNotBlank();
  });

  test('email', 'Email is required', () => {
    enforce(data.email).isNotBlank();
  });

  optional('email');
}, userSchema);

// All suite APIs are typed to schema keys.
// Try changing 'username' to an invalid field name
// to see a type error.
suite.remove('username');
suite.resetField('email');
suite.focus({ only: 'username' });
suite.only('age');
suite.afterField('email', () => {});

// Result selectors are typed too:
const result = suite.get();
result.hasErrors('username');
result.getErrors('email');
result.isValid('age');

// .run() enforces the schema data shape:
suite.run({
  username: 'alice',
  email: 'alice@example.com',
  age: 30,
});
`;

const ConfigSuiteCode = `import { create, enforce } from 'vest';

// Declare field and group names explicitly
// via the config generic.
const suite = create<{
  fields: 'username' | 'email' | 'password';
  groups: 'auth' | 'profile';
}>(data => {

  // Destructure typed helpers from the suite:
  const { test, group, only, skip, include, optional } = suite;

  test('username', 'Username is required', () => {
    enforce(data.username).isNotBlank();
  });

  group('auth', () => {
    test('password', 'Password is required', () => {
      enforce(data.password).isNotBlank();
    });
  });

  optional('email');
});

// All suite APIs enforce the declared names.
// Try changing 'username' to 'phone' to see a
// type error.
suite.remove('username');
suite.resetField('email');
suite.focus({ only: 'password', onlyGroup: 'auth' });
suite.only('username');
suite.afterField('email', () => {});

// Result selectors are typed:
const result = suite.get();
result.hasErrors('username');
result.getErrors('email');
result.isValid('password');
`;

const MONACO_VERSION = '0.52.2';
const MONACO_CDN = `https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min`;

let monacoPromise = null;

function loadMonaco() {
  if (monacoPromise) return monacoPromise;

  monacoPromise = new Promise(resolve => {
    if (window.monaco) {
      resolve(window.monaco);
      return;
    }

    window.require = window.require || { paths: {} };
    window.require.paths = { vs: `${MONACO_CDN}/vs` };

    const script = document.createElement('script');
    script.src = `${MONACO_CDN}/vs/loader.js`;
    script.onload = () => {
      window.require(['vs/editor/editor.main'], () => {
        resolve(window.monaco);
      });
    };
    document.head.appendChild(script);
  });

  return monacoPromise;
}

function configureMonaco(monaco) {
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ESNext,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    strict: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    allowNonTsExtensions: true,
  });

  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });

  monaco.languages.typescript.typescriptDefaults.addExtraLib(
    vestDts,
    'file:///node_modules/vest/index.d.ts',
  );
}

function MonacoEditorInner({ code }) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    let disposed = false;

    loadMonaco().then(monaco => {
      if (disposed || !containerRef.current) return;

      configureMonaco(monaco);

      editorRef.current = monaco.editor.create(containerRef.current, {
        value: code,
        language: 'typescript',
        theme: 'vs-dark',
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        scrollBeyondLastLine: false,
        readOnly: false,
        automaticLayout: true,
        tabSize: 2,
      });
    });

    return () => {
      disposed = true;
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, [code]);

  return <div ref={containerRef} style={{ height: 500 }} />;
}

function MonacoEditor({ code }) {
  return (
    <BrowserOnly fallback={<div>Loading Editor...</div>}>
      {() => <MonacoEditorInner code={code} />}
    </BrowserOnly>
  );
}

export function SchemaTypedSandpack() {
  return (
    <div className={commonStyles.codeWindow}>
      <MonacoEditor code={SchemaSuiteCode} />
    </div>
  );
}

export function ConfigTypedSandpack() {
  return (
    <div className={commonStyles.codeWindow}>
      <MonacoEditor code={ConfigSuiteCode} />
    </div>
  );
}
