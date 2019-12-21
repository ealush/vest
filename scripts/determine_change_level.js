const { MAJOR_KEYWORD, MINOR_KEYWORD, PATCH_KEYWORD } = require('./constants');

/**
 * Determines semver level
 * @param {String} message
 * @return {String} change level
 */
const determineChangeLevel = (message) => {
    if (message.toLowerCase().includes(`[${MAJOR_KEYWORD}]`)) {
        return MAJOR_KEYWORD;
    }

    if (message.toLowerCase().includes(`[${MINOR_KEYWORD}]`)) {
        return MINOR_KEYWORD;
    }

    return PATCH_KEYWORD;
};

module.exports = determineChangeLevel;
