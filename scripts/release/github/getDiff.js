const exec = require('child_process').execSync;

const { packageNames } = require('../../../util');

const IGNORE_KEYWORDS = ['docs', 'conf', 'ci', 'build'];
const IGNORE_PATTERN = new RegExp(
  `${IGNORE_KEYWORDS.join('|')}:|dependabot`,
  'i'
);

const { CURRENT_BRANCH, STABLE_BRANCH } = process.env;

function listMessages() {
  exec(`git fetch origin ${STABLE_BRANCH}`);

  const output = exec(
    `git log origin/${STABLE_BRANCH}..origin/${CURRENT_BRANCH} --pretty='format:%h  %s (%an)'`
  );
  return output
    .toString()
    .split('\n')
    .filter(msg => !msg.match(IGNORE_PATTERN));
}

const packageMatch = packageName =>
  new RegExp(`\\[${packageName}\\]|\\(${packageName}\\)`, 'i');

function splitMessagesByPackage(messages) {
  return messages.reduce((accumulator, message) => {
    let [modifiedPackage] = packageNames.ALL_PACKAGES.filter(
      packageName => !!message.match(packageMatch(packageName))
    );

    modifiedPackage = modifiedPackage || packageNames.VEST;

    accumulator[modifiedPackage] = []
      .concat(
        accumulator[modifiedPackage],
        message.replace(packageMatch(modifiedPackage), '')
      )
      .filter(Boolean);

    return accumulator;
  }, {});
}

module.exports = async function getDiff() {
  const allMessages = listMessages();
  const messagesPerPackage = splitMessagesByPackage(allMessages);

  return {
    allMessages,
    messagesPerPackage,
    changedPackages: Object.keys(messagesPerPackage),
  };
};
