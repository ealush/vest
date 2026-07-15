import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';
import { afterEach, describe, expect, it, vi } from 'vitest';

import debounce from '../../exports/debounce';
import { memo } from '../../exports/memo';
import { SuiteSerializer } from '../../exports/SuiteSerializer';
import * as vest from '../../vest';

type Runtime = Record<string, unknown>;

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../../..',
);

const moduleMap: Runtime = {
  vest,
  'vest/debounce': { __esModule: true, default: debounce },
  'vest/exports/SuiteSerializer': { SuiteSerializer },
  'vest/memo': { memo },
};

function readCodeBlock(relativePath: string, blockIndex: number): string {
  const markdown = fs.readFileSync(path.join(REPO_ROOT, relativePath), 'utf8');
  const blocks = [
    ...markdown.matchAll(
      /```(?:js|jsx|ts|tsx|javascript|typescript)[^\n]*\n([\s\S]*?)```/g,
    ),
  ];
  const block = blocks[blockIndex]?.[1];

  if (!block) {
    throw new Error(`Missing code block ${blockIndex} in ${relativePath}`);
  }

  return block;
}

function executeCodeBlock(
  relativePath: string,
  blockIndex: number,
  runtime: Runtime = {},
): Record<string, unknown> {
  const source = readCodeBlock(relativePath, blockIndex);
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: `${path.basename(relativePath)}.ts`,
    reportDiagnostics: true,
  });

  const diagnostics = output.diagnostics ?? [];
  if (diagnostics.length > 0) {
    throw new Error(
      diagnostics
        .map(diagnostic =>
          ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
        )
        .join('\n'),
    );
  }

  const module = { exports: {} as Record<string, unknown> };
  const names = Object.keys(runtime);
  const values = Object.values(runtime);
  const requireFromExample = (id: string): unknown => {
    if (!(id in moduleMap)) throw new Error(`Unmapped docs import: ${id}`);
    return moduleMap[id];
  };

  const run = new Function(
    'require',
    'module',
    'exports',
    ...names,
    output.outputText,
  );
  run(requireFromExample, module, module.exports, ...values);

  return module.exports;
}

function executeTestBody(
  relativePath: string,
  blockIndex: number,
  runtime: Runtime = {},
) {
  const source = readCodeBlock(relativePath, blockIndex);
  const imports = source.match(/^import .*;$/gm) ?? [];
  const body = source.replace(/^import .*;\n?/gm, '');
  const wrapped = `${imports.join('\n')}\nimport { create } from 'vest';\nexport const docsSuite = create((data) => {\n${body}\n});`;
  const virtualPath = path.join(REPO_ROOT, '.docs-example-body.ts');
  const output = ts.transpileModule(wrapped, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: virtualPath,
  });
  const module = { exports: {} as Record<string, unknown> };
  const names = Object.keys(runtime);
  const values = Object.values(runtime);
  const requireFromExample = (id: string): unknown => {
    if (!(id in moduleMap)) throw new Error(`Unmapped docs import: ${id}`);
    return moduleMap[id];
  };
  const run = new Function(
    'require',
    'module',
    'exports',
    ...names,
    output.outputText,
  );
  run(requireFromExample, module, module.exports, ...values);
  return module.exports.docsSuite as ReturnType<typeof vest.create>;
}

describe('executable documentation examples', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('runs the Getting Started suite exactly as documented', async () => {
    const checkUsername = vi.fn(async (username: string) => ({
      available: username !== 'taken',
    }));
    const { signupSuite } = executeCodeBlock('website/docs/get_started.md', 0, {
      checkUsername,
    }) as { signupSuite: ReturnType<typeof vest.create> };

    const valid = await signupSuite.runStatic({
      email: 'ada@example.com',
      username: 'ada',
    });
    expect(valid.isValid()).toBe(true);

    const invalid = await signupSuite.runStatic({ email: '', username: 'x' });
    expect(invalid.hasErrors('email')).toBe(true);
    expect(invalid.hasErrors('username')).toBe(true);
  });

  it('skips remote async work until documented local rules pass', async () => {
    const fetch = vi.fn(async (_url: string, options: { body: string }) => ({
      json: async () => ({
        available: !JSON.parse(options.body).username.includes('taken'),
      }),
    }));
    const { accountSuite } = executeCodeBlock(
      'website/docs/guides/async-validation-race-conditions.md',
      0,
      { fetch },
    ) as { accountSuite: ReturnType<typeof vest.create> };

    const localFailure = await accountSuite.runStatic({ username: 'x' });
    expect(localFailure.hasErrors('username')).toBe(true);
    expect(fetch).not.toHaveBeenCalled();

    const remoteFailure = await accountSuite.runStatic({ username: 'taken' });
    expect(fetch).toHaveBeenCalledOnce();
    expect(remoteFailure.getErrors('username')).toContain(
      'Username is already taken',
    );
  });

  it('distinguishes skipped prerequisites from omitted sections', async () => {
    const isNewCustomer = vi.fn(async () => true);
    const { checkoutSuite } = executeCodeBlock(
      'website/docs/guides/conditional-sections.md',
      0,
      { isNewCustomer },
    ) as { checkoutSuite: ReturnType<typeof vest.create> };

    const pickup = await checkoutSuite.runStatic({
      email: 'ada@example.com',
      needsShipping: false,
      street: '',
    });
    expect(pickup.isValid()).toBe(true);

    const shipping = await checkoutSuite.runStatic({
      email: 'ada@example.com',
      needsShipping: true,
      street: '',
    });
    expect(shipping.hasErrors('street')).toBe(true);
  });

  it('revalidates documented dependent password fields together', () => {
    const { passwordSuite } = executeCodeBlock(
      'website/docs/guides/dependent-fields.md',
      0,
    ) as { passwordSuite: ReturnType<typeof vest.create> };

    passwordSuite.run({
      password: 'long-secret',
      confirmPassword: 'long-secret',
    });
    const changed = passwordSuite.only('password').run({
      password: 'new-secret-value',
      confirmPassword: 'long-secret',
    });

    expect(changed.hasErrors('confirmPassword')).toBe(true);
  });

  it('reconciles documented dynamic-list tests by stable key', () => {
    const { tripSuite } = executeCodeBlock(
      'website/docs/guides/dynamic-lists.md',
      0,
    ) as { tripSuite: ReturnType<typeof vest.create> };
    const travelers = [
      { id: 'a', name: '', passportNumber: '' },
      { id: 'b', name: 'Ada', passportNumber: 'P123' },
    ];

    expect(
      tripSuite.run(travelers.length ? { travelers } : {}).hasErrors(),
    ).toBe(true);
    const afterRemoval = tripSuite.run({ travelers: [travelers[1]] });
    expect(afterRemoval.hasErrors()).toBe(false);
  });

  it('runs and memoizes the documented debounced coupon suite', async () => {
    vi.useFakeTimers();
    const fetch = vi.fn(async () => ({
      json: async () => ({ valid: true }),
      ok: true,
    }));
    const { couponSuite } = executeCodeBlock(
      'website/docs/guides/memo-and-debounce.md',
      0,
      { fetch },
    ) as { couponSuite: ReturnType<typeof vest.create> };

    const first = couponSuite.run({ cartTotal: 120, coupon: 'SAVE0025' });
    expect(first.isPending('coupon')).toBe(true);
    await vi.advanceTimersByTimeAsync(300);
    await first;

    const cached = await couponSuite.run({
      cartTotal: 120,
      coupon: 'SAVE0025',
    });
    expect(cached.isValid()).toBe(true);
    expect(fetch).toHaveBeenCalledOnce();
  });

  it('reports validity for each documented workflow group', () => {
    const { onboardingSuite } = executeCodeBlock(
      'website/docs/guides/multi-step-workflows.md',
      0,
    ) as { onboardingSuite: ReturnType<typeof vest.create> };

    const result = onboardingSuite.run({
      displayName: 'Ada',
      email: '',
      plan: 'pro',
    });
    expect(result.isValidByGroup('account')).toBe(false);
    expect(result.isValidByGroup('profile')).toBe(true);
    expect(result.isValidByGroup('billing')).toBe(true);
  });

  it('returns the parsed value from the documented typed schema', async () => {
    const { registrationSuite } = executeCodeBlock(
      'website/docs/guides/typed-schemas.md',
      0,
    ) as { registrationSuite: ReturnType<typeof vest.create> };

    const result = registrationSuite.runStatic({
      age: '36',
      newsletter: true,
      username: '  Ada  ',
    });
    expect(result.value).toEqual({
      age: 36,
      newsletter: true,
      username: 'Ada',
    });

    const standard = await registrationSuite['~standard'].validate({
      age: '36',
      newsletter: true,
      username: '  Ada  ',
    });
    expect(standard).toEqual({ value: result.value });
  });

  it('keeps the documented synchronous warning non-blocking', () => {
    const suite = executeTestBody(
      'website/docs/guides/validation-status.md',
      1,
    );

    const result = suite.runStatic({ password: 'letters' });
    expect(result.hasWarnings('password')).toBe(true);
    expect(result.hasErrors('password')).toBe(false);
    expect(result.isValid()).toBe(true);
  });

  it('keeps the documented asynchronous warning non-blocking', async () => {
    const suite = executeTestBody(
      'website/docs/guides/validation-status.md',
      2,
      { isCommonUsername: async () => true },
    );

    const result = await suite.runStatic({ username: 'user' });
    expect(result.hasWarnings('username')).toBe(true);
    expect(result.hasErrors('username')).toBe(false);
  });

  it('runs the documented context-aware schema rule', () => {
    const { schema } = executeCodeBlock(
      'website/docs/enforce/creating_custom_rules.md',
      4,
    ) as { schema: ReturnType<typeof vest.enforce.shape> };
    const suite = vest.create(() => {}, schema);

    expect(
      suite.runStatic({ password: 'secret', confirm: 'secret' }).hasErrors(),
    ).toBe(false);
    expect(
      suite.runStatic({ password: 'secret', confirm: 'different' }).hasErrors(),
    ).toBe(true);
  });
});
