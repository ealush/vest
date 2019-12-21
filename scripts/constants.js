const PATCH_KEYWORD = 'patch';
const MINOR_KEYWORD = 'minor';
const MAJOR_KEYWORD = 'major';

const CHANGELOG_TITLES = {
    [MAJOR_KEYWORD]: 'Breaking changes',
    [MINOR_KEYWORD]: 'Additions',
    [PATCH_KEYWORD]: 'Fixes and non breaking changes'
};

module.exports = {
    PATCH_KEYWORD,
    MINOR_KEYWORD,
    MAJOR_KEYWORD,
    CHANGELOG_TITLES
};
