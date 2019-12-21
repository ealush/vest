
const fs = require('fs');
const { format } = require('date-fns');
const determineLevel = require('./determine_change_level');
const { MAJOR_KEYWORD, MINOR_KEYWORD, PATCH_KEYWORD, CHANGELOG_TITLES } = require('./constants');

const CHANGE_LEVELS = [MAJOR_KEYWORD, MINOR_KEYWORD, PATCH_KEYWORD];

const version = process.env.NEXT_VERSION;
const gitLog = process.env.COMMIT_MESSAGES;

/**
 * Takes commit history and groups messages by change level
 * @param {String} gitLog commit history
 * @return {Object} an object with keys matching the semver levels
 */
const groupMessages = (gitLog) => gitLog.split('\n').reduce((accumulator, current) => {
    const level = determineLevel(current);

    if (!CHANGE_LEVELS.some((word) => current.toLowerCase().includes(word.toLowerCase()))) {
        return accumulator;
    }

    if (!accumulator[level]) {
        accumulator[level] = `### ${CHANGELOG_TITLES[level]}\n`;
    }

    return Object.assign(accumulator, {
        [level]: `${accumulator[level]}- ${current}\n`
    });
}, {});

const updateChangelog = () => {
    const groupedMessages = groupMessages(gitLog);

    const changelogTitle = `## [${version}] - ${format(new Date(), 'yyyy-MM-dd')}\n`;

    const versionLog = [
        changelogTitle,
        groupedMessages[MAJOR_KEYWORD],
        groupedMessages[MINOR_KEYWORD],
        groupedMessages[PATCH_KEYWORD]
    ].filter(Boolean).join('\n');

    const changelog = fs.readFileSync('./CHANGELOG.md', 'utf8').split('\n');
    changelog.splice(6, 0, versionLog);

    fs.writeFileSync('./CHANGELOG.md', changelog.join('\n'));

    console.log(versionLog); // eslint-disable-line
};

updateChangelog();
