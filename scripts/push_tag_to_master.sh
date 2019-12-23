git config --global user.email "${GIT_NAME}@users.noreply.github.com" --replace-all
git config --global user.name $GIT_NAME

echo "Removing old master"
git branch -D master

echo "Switching to new master"
git checkout -b master

echo "Bumping version"
npm version $NEXT_VERSION --no-git-tag

echo "Rebuilding with current tag"
yarn build

echo "Updating changelog"
CHANGELOG=$(node ./scripts/update_changelog.js)

EMOJIS=(🚀 🤘 ✨ 🔔 🌈 🤯)
EMOJI=${EMOJIS[$RANDOM % ${#EMOJIS[@]}]}

git add .
git commit -m "$EMOJI Vest update: $NEXT_VERSION" -m "$COMMIT_MESSAGES"

echo "Pushing to master"
git push https://${GITHUB_TOKEN}@github.com/$TRAVIS_REPO_SLUG.git master

git tag $NEXT_VERSION
git push origin $NEXT_VERSION

echo "Publishing Release"
node ./scripts/create_release.js "$CHANGELOG"

echo "Trying to update next branch"
git checkout next
git rebase master || git rebase --abort
git push https://${GITHUB_TOKEN}@github.com/$TRAVIS_REPO_SLUG.git next
