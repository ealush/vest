const { get } = require('lodash');
const fetch = require('node-fetch');

const { packageNames, filePaths } = require('../../../util');

const {
  GITHUB_REPOSITORY,
  CURRENT_BRANCH,
  GITHUB_TOKEN,
  STABLE_BRANCH,
} = process.env;

const compareUrl = `https://api.github.com/repos/${GITHUB_REPOSITORY}/compare/${STABLE_BRANCH}...${CURRENT_BRANCH}`;

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
  return fetch(compareUrl, {
    ...(GITHUB_TOKEN && {
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
    }),
  })
    .then(res => res.json())
    .catch(() => process.exit(1));
}

function splitMessagesByPackage(messages) {
  return messages.reduce((accumulator, message) => {
    let [modifiedPackage] = packageNames.ALL_PACKAGES.filter(packageName =>
      message.includes(`[${packageName}]`)
    );

    modifiedPackage = modifiedPackage || packageNames.VEST;

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
        .filter(filename => filename.startsWith(filePaths.DIR_NAME_PACKAGES))
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
