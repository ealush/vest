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
  const list = fs.readdirSync(dir);
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

// ─── Generate llms-full.txt ───────────────────────────────────────────────────

// eslint-disable-next-line no-console
console.log(`Building llms-full.txt from ${DOCS_DIR}...`);

const files = getFiles(DOCS_DIR);
let fullText = `# Vest 6 Documentation\n\n`;

files.forEach(file => {
  const fileContent = fs.readFileSync(file, 'utf8');
  const { content, title } = parseFrontmatter(fileContent);
  const relativePath = path.relative(DOCS_DIR, file);
  const displayTitle = title || relativePath;

  fullText += `\n\n\n`;
  fullText += `# ${displayTitle}\n\n`;
  fullText += content.trim();
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
  recipes: 'Recipes',
  usage_with_frameworks: 'Framework Integration',
  utilities: 'Utilities',
  writing_tests: 'Writing Tests',
  writing_your_suite: 'Writing Your Suite',
};

// Preferred section order
const sectionOrder = [
  '_root',
  'writing_your_suite',
  'writing_tests',
  'enforce',
  'usage_with_frameworks',
  'utilities',
  'recipes',
  'community_resources',
];

let llmsTxt = `# Vest 6
> Vest is a framework-agnostic form validation library for JavaScript that derives its syntax from modern unit testing frameworks like Mocha or Jest. It supports React, Vue, Svelte, and vanilla JS.

- [Full Documentation (All-in-one)](/llms-full.txt)
- [LLM Coding Instructions](/LLM_INSTRUCTIONS.md)

## Key Concepts
- **Stateful Validation**: Vest manages validation state (pending, failed, valid) across renders.
- **Focused Updates**: Validate only specific fields (e.g., on blur) using \`only()\` or \`skip()\` while retaining the state of others.
- **Conditional Inclusion**: Use \`skipWhen\`, \`omitWhen\`, and \`include\` to dynamically control which tests run.
- **Optional Fields**: Mark fields as optional to allow them to be empty or valid.

## Advanced Features
- **Async Tests**: Native Promise support for server-side checks.
- **Server-Side Validation**: Stateless runs using \`runStatic\` and state serialization/hydration.
- **Schema Validation**: Structural validation using \`enforce\` schemas.
- **Type Safety**: TypeScript support for suites and enforce rules.

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
    llmsTxt += `- [${entry.title}](${entry.path})\n`;
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

const CONSUMER_LLMS_SOURCE = path.join(ROOT_DIR, 'packages/vest/llms.txt');

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
