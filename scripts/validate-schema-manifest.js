/**
 * validate-schema-manifest — structural integrity gate for
 * docs/schema-relationships-acceptance-status.json (plan acceptance §6).
 *
 * Checks, all fail-closed:
 * 1. Row IDs are unique; status/result fields use known values.
 * 2. Every testFiles entry exists on disk.
 * 3. Every testNames entry matches at least one executed `it()` title in
 *    the row's files. Prefix/substring matching is intentional: parameterized
 *    `it.each` titles contain runtime values, so rows name the stable cell
 *    prefix recoverable from the report. Zero matches fail.
 * 4. Listed test files contain no skipped/todo/focused tests
 *    (it.skip, it.todo, describe.skip, it.only, describe.only, xit, xdescribe).
 * 5. Covered rows carry a command and either test files or a gate-script
 *    command; open rows carry rationale notes.
 * Exit nonzero on any violation.
 */
/* eslint-disable no-console */
const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..');
const MANIFEST = path.join(
  REPO_ROOT,
  'docs',
  'schema-relationships-acceptance-status.json',
);

const KNOWN_STATUSES = new Set(['open', 'covered']);
const KNOWN_RESULTS = new Set(['open', 'pass', 'fail', 'partial', 'not-run']);

let failures = 0;

function fail(message) {
  failures += 1;
  console.error(`manifest INVALID: ${message}`);
}

function callPattern() {
  // it.each arguments nest arbitrarily; allow three paren levels, which
  // covers every current it.each table expression in the repo.
  const nested = '[^()]*(?:\\([^()]*(?:\\([^()]*\\)[^()]*)*\\)[^()]*)*';
  return new RegExp(
    `\\b(?:it\\.each\\(${nested}\\)|it|test|checkCase|pass)\\s*\\(\\s*(['"\`])`,
    'g',
  );
}

function collectItTitles(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  // Section markers come from comments, so they are read before comment
  // stripping. Everything else must live in executed code: comments,
  // commented tests, and uninvoked helpers never count as evidence.
  const sections = collectMatchedGroups(source, /^\s*\/\/\s*(\d+\..*)$/gm);
  const code = stripNonExecutedCode(source);
  return [
    ...collectCallTitles(code),
    ...sections,
    ...collectMatchedGroups(code, /\bid\s*:\s*'([^']+)'|\bid\s*:\s*"([^"]+)"/g),
    ...collectMatchedGroups(
      code,
      /\blabel\s*:\s*'([^']+)'|\blabel\s*:\s*"([^"]+)"/g,
    ),
  ];
}

/**
 * Removes block comments, full-line comments, and uncalled function
 * bodies. A function counts as called when its name is invoked anywhere
 * besides its own declaration; uncalled bodies are cut out with
 * balanced-brace scanning so quoted prose and commented tests inside them
 * cannot masquerade as executed evidence.
 */
function stripNonExecutedCode(source) {
  const withoutBlocks = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const lines = withoutBlocks.split('\n');
  const kept = lines.filter(line => !/^\s*\/\//.test(line));
  return stripUncalledFunctions(kept.join('\n'));
}

function declaredFunctionNames(source) {
  const names = [];
  const patterns = [
    {
      callsInDeclaration: 1,
      pattern: /function\s+([A-Za-z_$][\w$]*)\s*\(/g,
    },
    {
      callsInDeclaration: 0,
      pattern:
        /(?:^|[;{}\s])const\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\(/gm,
    },
  ];
  for (const { callsInDeclaration, pattern } of patterns) {
    const scanning = new RegExp(pattern.source, pattern.flags);
    let match = null;
    while ((match = scanning.exec(source)) !== null) {
      names.push({
        callsInDeclaration,
        index: match.index,
        name: match[1],
      });
    }
  }
  return names;
}

function callOccurrences(source, name) {
  const pattern = new RegExp(`\\b${name}\\s*\\(`, 'g');
  let count = 0;
  while (pattern.exec(source) !== null) {
    count += 1;
  }
  return count;
}

function skipBalancedBraces(source, openIndex) {
  let depth = 0;
  let quote = null;
  let seenBrace = false;
  for (let i = openIndex; i < source.length; i += 1) {
    const stepped = stepBraceChar(source, i, depth, quote);
    depth = stepped.depth;
    quote = stepped.quote;
    i = stepped.index;
    // The declaration's own parameter parens must not terminate the scan:
    // only a brace-balanced close ends the function body.
    if (stepped.openedBrace === true) seenBrace = true;
    if (seenBrace && depth === 0) return i + 1;
  }
  return -1;
}

function stepBraceChar(source, i, depth, quote) {
  if (quote !== null) {
    const stepped = stepQuotedBrace(source, i, depth, quote);
    return { ...stepped, openedBrace: false };
  }
  return stepUnquotedBrace(source, i, depth, quote);
}

function stepUnquotedBrace(source, i, depth, quote) {
  const char = source[i];
  if (isQuoteChar(char)) {
    return { depth, index: i, openedBrace: false, quote: char };
  }
  return stepBracketChar(char, i, depth, quote);
}

function stepBracketChar(char, i, depth, quote) {
  if (char === '(' || char === '{') return stepOpenBrace(char, i, depth, quote);
  if (char === ')' || char === '}') {
    return { depth: depth - 1, index: i, openedBrace: false, quote };
  }
  return { depth, index: i, openedBrace: false, quote };
}

function isQuoteChar(char) {
  return char === "'" || char === '"' || char === '`';
}

function stepOpenBrace(char, i, depth, quote) {
  if (char === '{') {
    return { depth: depth + 1, index: i, openedBrace: true, quote };
  }
  return { depth: depth + 1, index: i, openedBrace: false, quote };
}

function stepQuotedBrace(source, i, depth, quote) {
  const char = source[i];
  if (char === '\\') return { depth, index: i + 1, quote };
  if (char === quote) return { depth, index: i, quote: null };
  return { depth, index: i, quote };
}

function uncalledRanges(source) {
  const ranges = [];
  for (const { callsInDeclaration, index, name } of declaredFunctionNames(
    source,
  )) {
    if (callOccurrences(source, name) > callsInDeclaration) continue;
    const end = skipBalancedBraces(source, index);
    if (end !== -1) ranges.push([index, end]);
  }
  return ranges;
}

function stripUncalledFunctions(source) {
  const ranges = uncalledRanges(source).sort((a, b) => b[0] - a[0]);
  let stripped = source;
  for (const [start, end] of ranges) {
    stripped = stripped.slice(0, start) + stripped.slice(end);
  }
  return stripped;
}

function collectCallTitles(source) {
  // it('title'), test('title') for vest suite callbacks declared inside
  // tests, it.each(<expression>)('title'), checkCase('x') for gate
  // self-tests, and pass('...') for gate boundary evidence: all carry
  // executable identities.
  const titles = [];
  const pattern = callPattern();
  let call = null;
  while ((call = pattern.exec(source)) !== null) {
    const title = readQuoted(source, pattern.lastIndex - 1, call[1]);
    if (title !== null) titles.push(title);
  }
  return titles;
}

function collectMatchedGroups(source, pattern) {
  const titles = [];
  let match = null;
  const scanning = new RegExp(pattern.source, pattern.flags);
  while ((match = scanning.exec(source)) !== null) {
    const title = match[1] ?? match[2];
    if (title !== undefined) titles.push(title.trim());
  }
  return titles;
}

function identityMatches(title, name) {
  if (title.includes(name)) return true;
  // Template placeholders (${...}) stand for runtime values: match the
  // static skeleton against the claimed identity.
  const skeleton = title
    .split(/\$\{[^}]*\}/)
    .map(escapeRegExp)
    .join('.+');
  try {
    return new RegExp(`^${skeleton}$`).test(name);
  } catch {
    return false;
  }
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function readQuoted(source, quoteIndex, quote) {
  const bodyPattern =
    quote === '`'
      ? /^`((?:\\.|[^`\\])*)`/
      : new RegExp(`^${quote}((?:\\\\.|[^${quote}\\n])*)${quote}`);
  const match = bodyPattern.exec(source.slice(quoteIndex));
  return match ? match[1] : null;
}

function checkSkippedTests(filePath, rowId) {
  const source = fs.readFileSync(filePath, 'utf8');
  const banned = [
    'it.skip(',
    'it.todo(',
    'describe.skip(',
    'it.only(',
    'describe.only(',
    'test.skip(',
    'test.todo(',
    'test.only(',
    'xit(',
    'xdescribe(',
  ];
  for (const marker of banned) {
    if (source.includes(marker)) {
      fail(`${rowId}: ${filePath} contains skipped/focused marker ${marker}`);
    }
  }
}

const packageScripts = (() => {
  try {
    return (
      JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'package.json'), 'utf8'))
        .scripts ?? {}
    );
  } catch {
    return {};
  }
})();

function hasYarnScriptCommand(command) {
  const first = command.trim().split(/\s+/)[0];
  if (first !== 'yarn') return false;
  const script = command.trim().split(/\s+/)[1];
  return (
    typeof script === 'string' &&
    Object.hasOwn(packageScripts, script) &&
    !script.startsWith('release')
  );
}

const TITLE_EXTENSIONS = ['.test.ts', '.test-d.ts', '.mts', '.cts', '.js'];

function isTitleSource(file) {
  return TITLE_EXTENSIONS.some(extension => file.endsWith(extension));
}

function existingFile(file) {
  const full = path.join(REPO_ROOT, file);
  return fs.existsSync(full) && fs.statSync(full).isFile() ? full : null;
}

function validateRowIdentity(row) {
  if (!KNOWN_STATUSES.has(row.status)) {
    fail(`${row.id}: unknown status ${row.status}`);
  }
  if (!KNOWN_RESULTS.has(row.result)) {
    fail(`${row.id}: unknown result ${row.result}`);
  }
}

function checkOneFile(row, file) {
  const full = path.join(REPO_ROOT, file);
  if (!fs.existsSync(full)) {
    fail(`${row.id}: test file missing: ${file}`);
  } else if (!fs.statSync(full).isFile()) {
    fail(`${row.id}: test file is not a file: ${file}`);
  } else if (isTitleSource(file)) {
    checkSkippedTests(full, row.id);
  }
}

function validateRowFiles(row) {
  const files = row.testFiles ?? [];
  for (const file of files) {
    checkOneFile(row, file);
  }
  return files;
}

function titlesForRow(files) {
  return files.flatMap(file => {
    const full = existingFile(file);
    if (full === null || !isTitleSource(file)) return [];
    return collectItTitles(full);
  });
}

function checkOneName(row, files, titles, name) {
  if (name.trim().length === 0) {
    fail(`${row.id}: empty test name entry`);
    return;
  }
  const hits = titles.filter(title => identityMatches(title, name));
  if (hits.length === 0 && files.length > 0) {
    fail(`${row.id}: test name unmatched by any it() title: ${name}`);
  }
}

function validateRowNames(row, files) {
  const titles = titlesForRow(files);
  for (const name of row.testNames ?? []) {
    checkOneName(row, files, titles, name);
  }
}

function commandEvidence(command) {
  const hasCommand = typeof command === 'string' && command.length > 0;
  const hasKnownCommand =
    hasCommand &&
    (/gate|scripts\//.test(command) || hasYarnScriptCommand(command));
  return { hasCommand, hasKnownCommand };
}

function commandTestTargets(command) {
  // File targets a command actually executes: quoted or bare *.test.*
  // paths. A command naming a nonexistent target verifies nothing.
  const targets = [];
  const pattern =
    /['"`]([^'"`]*\.test\.[cm]?[tj]s)['"`]|([\w\-./]+\.test\.[cm]?[tj]s)/g;
  let match = null;
  while ((match = pattern.exec(command)) !== null) {
    targets.push(match[1] ?? match[2]);
  }
  return [...new Set(targets)];
}

function validateCoveredEvidence(row, files) {
  assertCoveredCommand(row, files);
  assertCoveredTargets(row);
  assertCoveredStatus(row);
}

function assertCoveredCommand(row, files) {
  const { hasCommand, hasKnownCommand } = commandEvidence(row.command);
  if (!hasCommand) fail(`${row.id}: covered row without command`);
  if (files.length === 0 && !hasKnownCommand) {
    fail(
      `${row.id}: covered row without test files, gate command, or repo script`,
    );
  }
}

function assertCoveredTargets(row) {
  for (const target of commandTestTargets(row.command ?? '')) {
    if (!fs.existsSync(path.join(REPO_ROOT, target))) {
      fail(`${row.id}: command target missing: ${target}`);
    }
  }
}

function assertCoveredStatus(row) {
  if (row.status === 'covered' && row.result !== 'pass') {
    fail(
      `${row.id}: covered status contradicts result ${row.result}; use open status or record a passing run`,
    );
  }
}

function validateOpenRationale(row) {
  if (!row.notes || row.notes.trim().length === 0) {
    fail(`${row.id}: open row without rationale notes`);
  }
}

function validateRowEvidence(row, files) {
  if (row.status === 'covered') {
    validateCoveredEvidence(row, files);
  } else if (row.status === 'open') {
    validateOpenRationale(row);
  }
}

function validateRow(row, seen) {
  if (seen.has(row.id)) fail(`duplicate row id ${row.id}`);
  seen.add(row.id);
  validateRowIdentity(row);
  const files = validateRowFiles(row);
  validateRowNames(row, files);
  validateRowEvidence(row, files);
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const seen = new Set();
  for (const row of manifest.rows ?? []) {
    validateRow(row, seen);
  }
  if (failures > 0) {
    throw new Error(`manifest validation failed (${failures})`);
  }
  console.log(
    `manifest valid: ${seen.size} rows, unique ids, resolved test identities`,
  );
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.stack ?? error}\n`);
  process.exitCode = 1;
}
