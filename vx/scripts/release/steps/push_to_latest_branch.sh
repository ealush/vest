#!/bin/sh

git config --global user.email $EMAIL_ADDRESS --replace-all
git config --global user.name $GIT_NAME

echo "Fetching stable for reference"
git fetch https://$PUBLIC_REPO_TOKEN@github.com/$GITHUB_REPOSITORY.git $STABLE_BRANCH

echo "Rebasing hotfixes"
git rebase $STABLE_BRANCH

echo "Deleting local stable branch"
git branch -D $STABLE_BRANCH

echo "Checking out new local stable branch"
git checkout -b $STABLE_BRANCH

echo "Commiting"
git add .
git commit -m "$1" -m "$2"

echo "Pushing to $STABLE_BRANCH"
git push https://$PUBLIC_REPO_TOKEN@github.com/$GITHUB_REPOSITORY.git $STABLE_BRANCH -f

echo "Deleting local latest branch ($LATEST_BRANCH)"
git branch -D $LATEST_BRANCH

echo "Checking out new local latest branch"
git checkout -b $LATEST_BRANCH

echo "Trying to update latest branch"
git push https://$PUBLIC_REPO_TOKEN@github.com/$GITHUB_REPOSITORY.git $LATEST_BRANCH
