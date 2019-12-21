const fetch = require('node-fetch');

function compareUrl(repo, [commit1, commit2]) {
    return `https://api.github.com/repos/${repo}/compare/${commit1}...${commit2}`;
}

function listMessages(commits = []) {
    return commits.reduce((accumulator, { commit, author, sha }) => {
        const [message] = commit.message.split('\n');
        const name = author.login || commit.author.name;
        return `${accumulator}${sha.slice(0, 7)} ${message} (${name})\n`;
    }, '');
}

function getCommitDiff(repo, branches, token) {
    return fetch(compareUrl(repo, branches), { ...token && { headers: { Authorization: `token ${token}` } } })
        .then((res) => res.json())
        .catch(() => process.exit(1));
}

async function init({
    repo,
    branches,
    token
} = {}) {
    const { commits } = await getCommitDiff(repo, branches, token);
    const messages = listMessages(commits);
    console.log(messages); // eslint-disable-line
}

init({
    repo: process.env.TRAVIS_REPO_SLUG,
    branches: ['master', process.env.TRAVIS_BRANCH],
    token: process.env.GITHUB_TOKEN
});
