import fs from 'node:fs';

import { afterEach, describe, expect, it, vi } from 'vitest';
import * as vest from 'vest';
import { memo } from 'vest/memo';

function readTemplateLiteral(url, constantName) {
  const source = fs.readFileSync(url, 'utf8');
  const marker = `const ${constantName} = \``;
  const start = source.indexOf(marker);
  if (start === -1) throw new Error(`Missing ${constantName} in ${url}`);

  const valueStart = start + marker.length;
  for (let index = valueStart; index < source.length; index++) {
    if (source[index] === '`' && source[index - 1] !== '\\') {
      const literal = source.slice(valueStart, index);
      return new Function(`return \`${literal}\`;`)();
    }
  }

  throw new Error(`Unterminated ${constantName} in ${url}`);
}

const getStartedSource = new URL('./Sandpack/GetStarted.js', import.meta.url);
const anyTestRecipeSource = new URL(
  './Sandpack/AnyTestRecipe.js',
  import.meta.url,
);
const asyncTestsSource = new URL('./Sandpack/AsyncTests.js', import.meta.url);
const rawExampleSource = new URL('./RawExample.js', import.meta.url);
const anyTestRecipeSuiteCode = readTemplateLiteral(
  anyTestRecipeSource,
  'SuiteCode',
);
const getStartedSuiteCode = readTemplateLiteral(getStartedSource, 'SuiteCode');
const rawExampleApiCode = readTemplateLiteral(rawExampleSource, 'ApiCode');
const rawExampleSuiteCode = readTemplateLiteral(rawExampleSource, 'SuiteCode');

function executeDefaultExport(source, modules) {
  const executable = source
    .replace(
      /import \{ ([^}]+) \} from '([^']+)';/g,
      (_match, names, moduleName) =>
        `const { ${names} } = modules['${moduleName}'];`,
    )
    .replace(
      /import \{ ([^}]+) \} from "([^"]+)";/g,
      (_match, names, moduleName) =>
        `const { ${names} } = modules['${moduleName}'];`,
    )
    .replace(/export default ([A-Za-z_$][\w$]*);/, 'return $1;');

  return new Function('modules', executable)(modules);
}

function executeNamedFunction(source, functionName) {
  const executable = source.replace(
    `export async function ${functionName}`,
    `async function ${functionName}`,
  );
  return new Function(`${executable}\nreturn ${functionName};`)();
}

describe('interactive code playgrounds', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('executes the exact Getting Started Sandpack suite', () => {
    const suite = executeDefaultExport(getStartedSuiteCode, { vest });

    const empty = suite.runStatic({ password: '', username: '' });
    expect(empty.getErrors('username')).toContain('Username is required');
    expect(empty.getErrors('password')).toContain('Password is required');

    const valid = suite.runStatic({ password: 'secret', username: 'ada' });
    expect(valid.isValid()).toBe(true);
  });

  it('returns the summary failure shape used by the any-test recipe', () => {
    const suite = executeDefaultExport(anyTestRecipeSuiteCode, { vest });

    const empty = suite.runStatic({ email: false, push: false, sms: false });
    expect(empty.getError()).toMatchObject({
      fieldName: 'email',
      message: 'Provide at least one channel',
    });

    const valid = suite.runStatic({ email: true, push: false, sms: false });
    expect(valid.isValid()).toBe(true);
  });

  it('keeps Sandpack examples on the latest published Vest release', () => {
    const sandpackDirectory = new URL('./Sandpack/', import.meta.url);
    const sandpackSources = fs
      .readdirSync(sandpackDirectory)
      .filter(fileName => fileName.endsWith('.js'))
      .map(fileName =>
        fs.readFileSync(new URL(fileName, sandpackDirectory), 'utf8'),
      );
    const runnableSources = [
      fs.readFileSync(rawExampleSource, 'utf8'),
      ...sandpackSources,
    ].filter(source => source.includes("vest: '"));

    expect(runnableSources.length).toBeGreaterThan(0);
    runnableSources.forEach(source => {
      const dependencyRange = source.match(/vest: '([^']+)'/)?.[1];
      expect(dependencyRange).toBe('latest');
    });
  });

  it('reads async completion state from the suite', () => {
    const source = fs.readFileSync(asyncTestsSource, 'utf8');

    expect(source).toContain('.afterEach(() => setRes(suite.get()))');
    expect(source).not.toMatch(/\.afterEach\(\([^)]+\) => setRes\(/);
  });

  it('proves Enforce can parse a boundary used by a stateless suite', () => {
    const schema = vest.enforce.shape({
      age: vest.enforce.isNumeric().toNumber(),
      email: vest.enforce.isString().trim(),
    });
    const suite = vest.create(data => {
      vest.test('age', 'Must be an adult', () => {
        vest.enforce(data.age).greaterThanOrEquals(18);
      });
    }, schema);

    expect(schema.parse({ age: '36', email: '  ada@vestjs.dev  ' })).toEqual({
      age: 36,
      email: 'ada@vestjs.dev',
    });

    const result = suite.runStatic({
      age: '36',
      email: '  ada@vestjs.dev  ',
    });
    expect(result.isValid()).toBe(true);
    expect(result.value).toEqual({ age: 36, email: 'ada@vestjs.dev' });
  });

  it('executes the exact async API shown in the main playground', async () => {
    vi.useFakeTimers();
    const checkUsername = executeNamedFunction(
      rawExampleApiCode,
      'checkUsername',
    );

    const available = checkUsername('ada');
    await vi.advanceTimersByTimeAsync(1000);
    await expect(available).resolves.toEqual({ available: true });

    const taken = checkUsername('taken-user');
    await vi.advanceTimersByTimeAsync(1000);
    await expect(taken).resolves.toEqual({ available: false });
  });

  it('aborts the main playground API immediately for an expired signal', async () => {
    vi.useFakeTimers();
    const checkUsername = executeNamedFunction(
      rawExampleApiCode,
      'checkUsername',
    );
    const controller = new AbortController();
    controller.abort();

    await expect(
      checkUsername('ada', { signal: controller.signal }),
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('executes the exact memoized async suite shown in the main playground', async () => {
    vi.useFakeTimers();
    const checkUsername = vi.fn(async username => ({
      available: !username.includes('taken'),
    }));
    const suite = executeDefaultExport(rawExampleSuiteCode, {
      './api': { checkUsername },
      vest,
      'vest/memo': { memo },
    });

    const first = await suite.run({ username: 'ada' });
    expect(first.isValid('username')).toBe(true);
    const repeated = await suite.run({ username: 'ada' });
    expect(repeated.isValid('username')).toBe(true);
    expect(checkUsername).toHaveBeenCalledOnce();

    const invalid = await suite.run({ username: 'taken-user' });
    expect(invalid.getErrors('username')).toContain('Username already taken');
  });
});
