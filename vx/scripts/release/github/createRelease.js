const fetch = require('node-fetch');

const { logger } = require('../../../util');

const { GITHUB_REPOSITORY, PUBLIC_REPO_TOKEN } = process.env;

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

async function release({ tag, release }) {
  logger.log(`💬 Creating github release: ${release.title}`);

  await postRelease({
    tag,
    body: release.body,
    title: release.title,
  });
}

module.exports = release;
