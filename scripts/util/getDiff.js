const { get } = require('lodash');
const fetch = require('node-fetch');
const { PACKAGE_NAMES } = require('../../config');
const { PACKAGE_VEST, PACKAGES_DIR } = require('../../shared/constants');

const {
  TRAVIS_REPO_SLUG,
  TRAVIS_BRANCH,
  GITHUB_TOKEN,
  DEFAULT_BRANCH,
} = process.env;

function compareUrl() {
  return `https://api.github.com/repos/${TRAVIS_REPO_SLUG}/compare/${DEFAULT_BRANCH}...${TRAVIS_BRANCH}`;
}

function listMessages(commits = []) {
  return commits
    .reduce((messages, { commit, author, sha }) => {
      const [message] = commit.message.split('\n');
      let name = get(author, 'login', get(commit, 'author.name'));
      name = name ? `(${name})` : '';
      return messages.concat(
        [sha.slice(0, 7), message, name].filter(Boolean).join(' ')
      );
    }, [])
    .filter(Boolean);
}

function getCommitDiff() {
  return fetch(compareUrl(), {
    ...(GITHUB_TOKEN && {
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
    }),
  })
    .then(res => res.json())
    .catch(() => process.exit(1));
}

function splitMessagesByPackage(messages) {
  return messages.reduce((accumulator, message) => {
    let [modifiedPackage] = PACKAGE_NAMES.filter(packageName =>
      message.includes(`[${packageName}]`)
    );

    modifiedPackage = modifiedPackage || PACKAGE_VEST;

    accumulator[modifiedPackage] = []
      .concat(
        accumulator[modifiedPackage],
        message.replace(`[${modifiedPackage}]`, '')
      )
      .filter(Boolean);

    return accumulator;
  }, {});
}

function findChangedPackages(files) {
  return [
    ...new Set(
      Object.values(files)
        .map(({ filename }) => filename)
        .filter(filename => filename.startsWith(PACKAGES_DIR))
        .map(fileName => {
          const [, packageName] = fileName.split('/');
          return packageName;
        })
    ),
  ];
}

module.exports = async function getDiff() {
  const { commits, files } = await getCommitDiff();

  const allMessages = listMessages(commits);
  const messagesPerPackage = splitMessagesByPackage(allMessages);

  return {
    allMessages,
    messagesPerPackage,
    changedPackages: findChangedPackages(files),
  };
};
