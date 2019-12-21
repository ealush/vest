const fetch = require('node-fetch');

const TITLE_DELIMITER = '\n\n';

const changelog = process.argv[2] || '';

function releaseUrl(repo) {
    return `https://api.github.com/repos/${repo}/releases`;
}

function postRelease({
    repo,
    token,
    tag,
    body
}) {
    console.log('posting release'); // eslint-disable-line
    fetch(releaseUrl(repo), {
        method: 'POST',
        headers: { Authorization: `token ${token}` },
        body: JSON.stringify({
            tag_name: tag,
            name: tag,
            body
        })
    });
}

function release({ repo, token, tag }) {
    console.log('In release'); // eslint-disable-line

    if (!(changelog && token && repo)) {
        return;
    }

    const body = changelog.substr(changelog.indexOf(TITLE_DELIMITER) + TITLE_DELIMITER.length);

    postRelease({
        repo,
        token,
        tag,
        body
    });
}

release({
    repo: process.env.TRAVIS_REPO_SLUG,
    token: process.env.GITHUB_TOKEN,
    tag: process.env.NEXT_VERSION,
    changelog
});
