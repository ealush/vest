#!/bin/sh

git config --global user.email $EMAIL_ADDRESS --replace-all
git config --global user.name $GIT_NAME

echo "Running Script push_to_latest_branch.sh"
echo "Current directory: $(pwd)"
echo "Workspace directory: $GITHUB_WORKSPACE"

echo "Going back to root folder"
cd $GITHUB_WORKSPACE

echo "Fetching stable for reference"
git fetch https://$PUBLIC_REPO_TOKEN@github.com/$GITHUB_REPOSITORY.git $STABLE_BRANCH || echo "Stable branch doesn't exist"

echo "Rebasing hotfixes"
git rebase $STABLE_BRANCH || echo "No hotfixes to rebase"

echo "Deleting local stable branch"
git branch -D $STABLE_BRANCH || echo "Failed to delete $STABLE_BRANCH. Continuing..."

echo "Checking out new local stable branch"
git checkout -b $STABLE_BRANCH

echo "Rebuilding yarn.lock"
yarn

echo "Cleaning up auth token"
yarn config unset npmAuthToken
yarn config unset npmAlwaysAuth

echo "Committing"
git add -A
git commit -m "$1" -m "$2"

echo "Pushing to $STABLE_BRANCH"
git push https://$PUBLIC_REPO_TOKEN@github.com/$GITHUB_REPOSITORY.git $STABLE_BRANCH -f

echo "Deleting local latest branch ($LATEST_BRANCH)"
git branch -D $LATEST_BRANCH  || echo "Failed to delete $LATEST_BRANCH. Continuing..."

echo "Checking out new local latest branch"
git checkout -b $LATEST_BRANCH

echo "Trying to update latest branch"
git push https://$PUBLIC_REPO_TOKEN@github.com/$GITHUB_REPOSITORY.git $LATEST_BRANCH
