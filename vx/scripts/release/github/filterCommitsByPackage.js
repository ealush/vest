const matchPackageNameInCommit = require('./matchPackageNameInCommit');

function filterCommitByPackage(packageName, commits) {
  return commits.filter(({ title, files }) => {
    if (title.match(matchPackageNameInCommit(packageName))) {
      return true;
    }

    if (
      files.some(file => {
        return file.match(`packages/${packageName}`);
      })
    ) {
      return true;
    }

    return false;
  });
}

module.exports = filterCommitByPackage;
