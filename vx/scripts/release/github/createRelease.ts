import * as logger from 'vx/logger.js';
// If using Node.js v18+, you can use the global fetch. Otherwise, ensure node-fetch is installed: npm install node-fetch
let fetchImpl: typeof fetch | undefined =
  typeof fetch !== 'undefined' ? fetch : undefined;

const { GITHUB_REPOSITORY, PUBLIC_REPO_TOKEN } = process.env;

type ReleasePayload = { tag: string; body: string; title: string };
type ReleaseInput = { tag: string; release: { title: string; body: string } };

async function getFetch(): Promise<typeof fetch> {
  if (!fetchImpl) {
    const imported = await import('node-fetch');
    fetchImpl = (imported.default ?? imported) as typeof fetch;
  }
  return fetchImpl;
}

async function postRelease({
  tag,
  body,
  title,
}: ReleasePayload): Promise<void> {
  if (!GITHUB_REPOSITORY || !PUBLIC_REPO_TOKEN) {
    throw new Error('Missing GitHub release environment configuration.');
  }

  const fetchFn = await getFetch();

  await fetchFn(`https://api.github.com/repos/${GITHUB_REPOSITORY}/releases`, {
    method: 'POST',
    headers: { Authorization: `token ${PUBLIC_REPO_TOKEN}` },
    body: JSON.stringify({
      tag_name: tag,
      name: title.replace(/#/g, ''),
      body,
    }),
  });
}

async function release({ tag, release }: ReleaseInput): Promise<void> {
  logger.log(`💬 Creating github release: ${release.title}`);

  await postRelease({
    tag,
    body: release.body,
    title: release.title,
  });
}

export default release;
