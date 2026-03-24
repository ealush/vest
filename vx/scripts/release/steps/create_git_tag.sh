#!/bin/sh

git config --global user.email $EMAIL_ADDRESS --replace-all
git config --global user.name $GIT_NAME

echo "Creating Git Tag: $1"
git tag -a "$1" -m "$1"

echo "Pushing Git Tag: $1"
git push https://$PUBLIC_REPO_TOKEN@github.com/$GITHUB_REPOSITORY.git $1