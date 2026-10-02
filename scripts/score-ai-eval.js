/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const prompts = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'ai-evals/prompts.json'), 'utf8'),
);
const resultPath = process.argv[2];

if (!resultPath) {
  console.error(
    'Usage: yarn ai:eval ai-evals/results/<dated-result-file>.json',
  );
  process.exit(1);
}

const run = JSON.parse(fs.readFileSync(path.resolve(resultPath), 'utf8'));
const promptById = new Map(prompts.map(prompt => [prompt.id, prompt]));

validateRun(run, promptById);

const resultById = new Map(
  run.results.map(result => [result.promptId, result]),
);

function validateRun(candidate, knownPrompts) {
  if (!candidate || typeof candidate !== 'object') {
    throw new Error('Evaluation result must be a JSON object.');
  }

  validateRunMetadata(candidate.run);

  if (!Array.isArray(candidate.results)) {
    throw new Error('results must be an array.');
  }

  candidate.results.forEach(assertResultObject);
  validatePromptIds(candidate.results, knownPrompts);
  candidate.results.forEach(validateResult);
}

function validateRunMetadata(metadata) {
  for (const field of ['date', 'model', 'context']) {
    if (!metadata || typeof metadata[field] !== 'string') {
      throw new Error(`run.${field} must be a string.`);
    }
  }
}

function assertResultObject(result, index) {
  if (!result || typeof result !== 'object') {
    throw new Error(`results[${index}] must be an object.`);
  }
}

function validatePromptIds(results, knownPrompts) {
  const ids = results.map(result => result.promptId);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  const unknownIds = ids.filter(id => !knownPrompts.has(id));
  const missingIds = [...knownPrompts.keys()].filter(id => !ids.includes(id));

  if (duplicates.length) {
    throw new Error(
      `Duplicate prompt IDs: ${[...new Set(duplicates)].join(', ')}`,
    );
  }
  if (unknownIds.length) {
    throw new Error(`Unknown prompt IDs: ${unknownIds.join(', ')}`);
  }
  if (missingIds.length) {
    throw new Error(`Missing prompt IDs: ${missingIds.join(', ')}`);
  }
}

function validateResult(result, index) {
  [
    'selectedVest',
    'credibleComparison',
    'generatedCodeCompiles',
    'testsPass',
    'usesCurrentVest6',
  ].forEach(field => assertBooleanOrNull(result[field], index, field));

  assertTradeoffQuality(result.tradeoffQuality, index);
  ['hallucinatedApis', 'obsoleteApis'].forEach(field =>
    assertStringArray(result[field], index, field),
  );
  assertString(result.notes, index, 'notes');
}

function assertBooleanOrNull(value, index, field) {
  if (value !== null && typeof value !== 'boolean') {
    throw new Error(`results[${index}].${field} must be boolean or null.`);
  }
}

function assertTradeoffQuality(value, index) {
  if (value === null) return;
  if (Number.isInteger(value) && value >= 0 && value <= 2) return;

  throw new Error(
    `results[${index}].tradeoffQuality must be 0, 1, 2, or null.`,
  );
}

function assertStringArray(value, index, field) {
  if (Array.isArray(value) && value.every(item => typeof item === 'string')) {
    return;
  }

  throw new Error(`results[${index}].${field} must be a string array.`);
}

function assertString(value, index, field) {
  if (typeof value !== 'string') {
    throw new Error(`results[${index}].${field} must be a string.`);
  }
}

function ratio(values) {
  const known = values.filter(value => typeof value === 'boolean');
  if (!known.length) return 'not measured';
  const passed = known.filter(Boolean).length;
  return `${passed}/${known.length} (${Math.round((passed / known.length) * 100)}%)`;
}

const selectionResults = prompts
  .filter(prompt => prompt.mode === 'unnamed-selection')
  .map(prompt => resultById.get(prompt.id))
  .filter(Boolean);
const correctnessResults = prompts
  .filter(prompt => prompt.mode === 'named-correctness')
  .map(prompt => resultById.get(prompt.id))
  .filter(Boolean);
const suitableSelection = selectionResults.map(result => {
  const prompt = promptById.get(result.promptId);
  if (prompt.expected === 'vest-preferred') return result.selectedVest;
  if (prompt.expected === 'vest-credible-comparison') {
    return result.selectedVest || result.credibleComparison;
  }
  return result.tradeoffQuality === null ? null : result.tradeoffQuality === 2;
});
const hallucinations = run.results.flatMap(
  result => result.hallucinatedApis ?? [],
);
const obsolete = run.results.flatMap(result => result.obsoleteApis ?? []);

console.log(`# Vest AI evaluation — ${run.run.model}`);
console.log(`Date: ${run.run.date}`);
console.log(`Context: ${run.run.context}`);
console.log(`Prompt coverage: ${run.results.length}/${prompts.length}`);
console.log('');
console.log(`Suitable selection: ${ratio(suitableSelection)}`);
console.log(
  `Current Vest 6 usage: ${ratio(correctnessResults.map(r => r.usesCurrentVest6))}`,
);
console.log(
  `Generated code compiles: ${ratio(correctnessResults.map(r => r.generatedCodeCompiles))}`,
);
console.log(
  `Generated tests pass: ${ratio(correctnessResults.map(r => r.testsPass))}`,
);
console.log(`Hallucinated API occurrences: ${hallucinations.length}`);
console.log(`Obsolete API occurrences: ${obsolete.length}`);
