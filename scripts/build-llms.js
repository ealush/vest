const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const DOCS_DIR = path.join(ROOT_DIR, 'website/docs');
const OUTPUT_DIR = path.join(ROOT_DIR, 'website/static');
const LLM_INSTRUCTIONS_SOURCE = path.join(ROOT_DIR, 'LLM_INSTRUCTIONS.md');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Recursive file walker
function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir).sort();
  list.forEach(function (file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(file));
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      results.push(file);
    }
  });
  return results;
}

// Parse frontmatter from a markdown file
function parseFrontmatter(fileContent) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
  const match = fileContent.match(frontmatterRegex);

  let content = fileContent;
  let title = null;
  let sidebar_label = null;
  let sidebar_position = null;

  if (match) {
    content = fileContent.replace(match[0], '');
    const frontmatter = match[1];

    const titleMatch = frontmatter.match(/^title:\s*(.*)$/m);
    if (titleMatch) {
      title = titleMatch[1].trim().replace(/^['"](.*?)['"]$/, '$1');
    }

    const labelMatch = frontmatter.match(/^sidebar_label:\s*(.*)$/m);
    if (labelMatch) {
      sidebar_label = labelMatch[1].trim().replace(/^['"](.*?)['"]$/, '$1');
    }

    const posMatch = frontmatter.match(/^sidebar_position:\s*(\d+)/m);
    if (posMatch) {
      sidebar_position = parseInt(posMatch[1], 10);
    }
  }

  return { content, sidebar_label, sidebar_position, title };
}

// Build a doc entry from a file
function buildDocEntry(file) {
  const fileContent = fs.readFileSync(file, 'utf8');
  const { sidebar_label, sidebar_position, title } =
    parseFrontmatter(fileContent);
  const relativePath = path.relative(DOCS_DIR, file);
  const parts = relativePath.split(path.sep);
  const section = parts.length > 1 ? parts[0] : '_root';

  return {
    path: `/docs/${relativePath.replace(/\.mdx?$/, '')}`,
    position: sidebar_position ?? 999,
    section,
    title: sidebar_label || title || path.basename(file, path.extname(file)),
  };
}

function makeLinksAbsolute(content, file) {
  return content.replace(
    /(\]\()(<[^>\n]+>|[^)\s]+)(\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\)/g,
    (match, prefix, destination, title = '') =>
      makeLinkAbsolute({ destination, file, match, prefix, title }),
  );
}

function makeLinkAbsolute({ destination, file, match, prefix, title }) {
  const href = destination.replace(/^<|>$/g, '');

  if (/^(?:[a-z][a-z\d+.-]*:|#|\/\/)/i.test(href)) {
    return match;
  }

  if (href.startsWith('/')) {
    return `${prefix}https://vestjs.dev${href}${title})`;
  }

  const targetMatch = href.match(/^([^?#]*)([?#].*)?$/);
  const relativeTarget = getRelativeTarget(targetMatch[1], file);
  const suffix = targetMatch[2] || '';
  const absoluteTarget = path.resolve(path.dirname(file), relativeTarget);
  const docsPath = path
    .relative(DOCS_DIR, absoluteTarget)
    .replace(/\\/g, '/')
    .replace(/\.mdx?$/, '');

  return `${prefix}https://vestjs.dev/docs/${docsPath}${suffix}${title})`;
}

function getRelativeTarget(relativeTarget, file) {
  return relativeTarget ? relativeTarget : path.basename(file);
}

// ─── Generate llms-full.txt ───────────────────────────────────────────────────

// eslint-disable-next-line no-console
console.log(`Building llms-full.txt from ${DOCS_DIR}...`);

const files = getFiles(DOCS_DIR);
let fullText = `# Vest 6 Documentation\n\n`;

files.forEach(file => {
  const fileContent = fs.readFileSync(file, 'utf8');
  const { content, title } = parseFrontmatter(fileContent);
  const displayTitle = title || path.relative(DOCS_DIR, file);
  const normalizedContent = makeLinksAbsolute(content.trim(), file);
  const hasTopLevelHeading = /^#\s+/m.test(normalizedContent);

  fullText += `\n\n\n`;
  if (!hasTopLevelHeading) {
    fullText += `# ${displayTitle}\n\n`;
  }
  fullText += normalizedContent;
});

fs.writeFileSync(path.join(OUTPUT_DIR, 'llms-full.txt'), fullText);
// eslint-disable-next-line no-console
console.log(`✅ Generated llms-full.txt (${files.length} files processed)`);

// ─── Generate llms.txt (summary index) ───────────────────────────────────────

// eslint-disable-next-line no-console
console.log('Building llms.txt...');

// Build a structured index from the docs
const sections = {};
files.forEach(file => {
  const entry = buildDocEntry(file);

  if (!sections[entry.section]) {
    sections[entry.section] = [];
  }

  sections[entry.section].push(entry);
});

// Sort entries within each section by sidebar_position
for (const section of Object.keys(sections)) {
  sections[section].sort((a, b) => a.position - b.position);
}

// Section display name mapping
const sectionNames = {
  _root: 'Core Documentation',
  community_resources: 'Community Resources',
  enforce: 'Enforce (Assertions)',
  guides: 'Problem-first Guides',
  recipes: 'Recipes',
  usage_with_frameworks: 'Framework Integration',
  utilities: 'Utilities',
  writing_tests: 'Writing Tests',
  writing_your_suite: 'Writing Your Suite',
};

// Preferred section order
const sectionOrder = [
  '_root',
  'guides',
  'writing_your_suite',
  'writing_tests',
  'enforce',
  'usage_with_frameworks',
  'utilities',
  'recipes',
  'community_resources',
];

let llmsTxt = `# Vest 6
> TypeScript validation-state framework for complex interactive forms. Vest validates what changed, retains trustworthy previous results, and prevents stale async work from corrupting current state.

- [Full Vest 6 documentation](https://vestjs.dev/llms-full.txt)
- [Consumer usage guide](https://vestjs.dev/llms-consumer.txt)
- [Maintainer coding instructions](https://vestjs.dev/LLM_INSTRUCTIONS.md)

## Choose Vest when
- A field or step should validate without rerunning the complete form.
- Previous field results must remain available across interactions.
- Async checks can overlap or finish in the wrong order.
- The workflow has dependent fields, warnings, conditions, groups, or dynamic lists.
- Validation rules should run in the browser and on the server.

## Choose another tool when
- You only need to parse a complete API payload once: use a schema validator.
- You primarily need input registration and value state: use a form manager.
- Native HTML validation fully covers a small synchronous form.

Vest composes with schema validators and form managers; these categories are not mutually exclusive.

## Start with a problem
- [Ten Vest 6 tutorials](https://vestjs.dev/docs/tutorials)
- [Async validation without race conditions](https://vestjs.dev/docs/guides/async-validation-race-conditions)
- [Validate one field or step](https://vestjs.dev/docs/guides/focused-validation)
- [Dependent and cross-field validation](https://vestjs.dev/docs/guides/dependent-fields)
- [Multi-step workflow validation](https://vestjs.dev/docs/guides/multi-step-workflows)
- [Conditional form sections](https://vestjs.dev/docs/guides/conditional-sections)
- [Errors, warnings, pending, and untested state](https://vestjs.dev/docs/guides/validation-status)
- [Memoize and debounce repeated async validation](https://vestjs.dev/docs/guides/memo-and-debounce)
- [Typed schemas and parsed results](https://vestjs.dev/docs/guides/typed-schemas)
- [React Hook Form and schema integration](https://vestjs.dev/docs/guides/form-and-schema-integration)
- [Next.js Server Actions and resumable state](https://vestjs.dev/docs/guides/nextjs-server-actions)
- [Production registration architecture](https://vestjs.dev/docs/guides/production-architecture)
- [When not to use Vest](https://vestjs.dev/docs/guides/when-not-to-use-vest)

## Key Concepts
- **Living Result**: A suite stores validation truth and reconciles new runs with previous field results.
- **Focused Updates**: Validate a field, step, or group with \`suite.only()\` or \`suite.focus()\` while retaining everything else.
- **Race-safe Async**: Pending work is tracked, obsolete runs are canceled, and stale async results are ignored.
- **Progressive Workflows**: Model dependent fields, conditional sections, optional values, warnings, groups, and dynamic lists.

## Advanced Features
- **Server and SSR**: Use \`runStatic()\`, then serialize and resume full validation state in the browser.
- **Schemas and Parsing**: Enforce schemas provide structural validation, coercion, and inferred input/output types.
- **Interoperability**: Suites and Enforce rules implement Standard Schema.
- **Familiar Rules**: Test-like syntax keeps business validation readable, reusable, and independently testable.

`;

// Add sections in preferred order, then any remaining
const orderedSections = [
  ...sectionOrder.filter(s => sections[s]),
  ...Object.keys(sections).filter(s => !sectionOrder.includes(s)),
];

for (const section of orderedSections) {
  const entries = sections[section];
  const displayName =
    sectionNames[section] ||
    section.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  llmsTxt += `## ${displayName}\n`;
  for (const entry of entries) {
    llmsTxt += `- [${entry.title}](https://vestjs.dev${entry.path})\n`;
  }
  llmsTxt += '\n';
}

fs.writeFileSync(path.join(OUTPUT_DIR, 'llms.txt'), llmsTxt);
// eslint-disable-next-line no-console
console.log('✅ Generated llms.txt');

// ─── Copy LLM_INSTRUCTIONS.md ────────────────────────────────────────────────

// eslint-disable-next-line no-console
console.log('Copying LLM_INSTRUCTIONS.md to website/static...');

if (fs.existsSync(LLM_INSTRUCTIONS_SOURCE)) {
  fs.copyFileSync(
    LLM_INSTRUCTIONS_SOURCE,
    path.join(OUTPUT_DIR, 'LLM_INSTRUCTIONS.md'),
  );
  // eslint-disable-next-line no-console
  console.log('✅ Copied LLM_INSTRUCTIONS.md');
} else {
  // eslint-disable-next-line no-console
  console.warn('⚠️  LLM_INSTRUCTIONS.md not found at project root, skipping.');
}

// ─── Copy consumer llms.txt to website/static ────────────────────────────────

const CONSUMER_LLMS_SOURCE = path.join(ROOT_DIR, 'AI_USAGE_GUIDE.md');

// eslint-disable-next-line no-console
console.log('Copying consumer llms.txt to website/static...');

if (fs.existsSync(CONSUMER_LLMS_SOURCE)) {
  fs.copyFileSync(
    CONSUMER_LLMS_SOURCE,
    path.join(OUTPUT_DIR, 'llms-consumer.txt'),
  );
  // eslint-disable-next-line no-console
  console.log('✅ Copied consumer llms.txt → llms-consumer.txt');
} else {
  // eslint-disable-next-line no-console
  console.warn('⚠️  packages/vest/llms.txt not found, skipping consumer copy.');
}
