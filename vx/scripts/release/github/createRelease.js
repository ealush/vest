const fetch = require('node-fetch');

const logger = require('vx/logger');

const { GITHUB_REPOSITORY, PUBLIC_REPO_TOKEN } = process.env;

/**
 * Posts a release object to GitHub.
 * @param {{ tag: string, body: string, title: string }} param0 Release payload.
 * @returns {Promise<void>}
 */
async function postRelease({ tag, body, title }) {
  await fetch(`https://api.github.com/repos/${GITHUB_REPOSITORY}/releases`, {
    method: 'POST',
    headers: { Authorization: `token ${PUBLIC_REPO_TOKEN}` },
    body: JSON.stringify({
      tag_name: tag,
      name: title.replace(/#/g, ''),
      body,
    }),
  });
}

/**
 * Creates a GitHub release.
 * @param {{ tag: string, release: { title: string, body: string } }} param0 Tag and release data.
 * @returns {Promise<void>}
 */
async function release({ tag, release }) {
  logger.log(`💬 Creating github release: ${release.title}`);

  await postRelease({
    tag,
    body: release.body,
    title: release.title,
  });
}

module.exports = release;
