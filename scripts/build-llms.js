const fs = require('fs');
const path = require('path');

// Configuration
const DOCS_DIR = path.join(__dirname, '../website/docs'); // Adjusted for script location
const OUTPUT_DIR = path.join(__dirname, '../website/static');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
// eslint-disable-next-line no-console
console.log(`Building llms-full.txt from ${DOCS_DIR}...`);

// Recursive file walker
function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function (file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      /* Recurse into a subdirectory */
      results = results.concat(getFiles(file));
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      results.push(file);
    }
  });
  return results;
}

const files = getFiles(DOCS_DIR);
let fullText = `# Vest 6 Documentation\n\n`;

files.forEach(file => {
  const fileContent = fs.readFileSync(file, 'utf8');

  // Simple frontmatter parser
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
  const match = fileContent.match(frontmatterRegex);

  let content = fileContent;
  let title = null;

  const relativePath = path.relative(DOCS_DIR, file);

  if (match) {
    content = fileContent.replace(match[0], '');
    const frontmatter = match[1];
    // Extract title from frontmatter
    const titleMatch = frontmatter.match(/^title:\s*(.*)$/m);
    if (titleMatch) {
      title = titleMatch[1].trim().replace(/^['"](.*)['"]$/, '$1'); // Remove quotes if present
    }
  }

  // Fallback to filename if no title found
  if (!title) {
    title = relativePath;
  }

  // Add a clear delimiter and header for the LLM
  fullText += `\n\n\n`;
  fullText += `# ${title}\n\n`;
  fullText += content.trim();
});

fs.writeFileSync(path.join(OUTPUT_DIR, 'llms-full.txt'), fullText);
// eslint-disable-next-line no-console
console.log(`✅ Generated llms-full.txt (${files.length} files processed)`);
