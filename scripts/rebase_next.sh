git config --global user.email "${EMAIL_ADDRESS}" --replace-all
git config --global user.name $GIT_NAME

echo "Trying to update next branch"
git fetch origin next

echo "Cleaning build artifacts"
git reset --hard
git checkout next
git rebase master || git rebase --abort
git push https://${GITHUB_TOKEN}@github.com/$TRAVIS_REPO_SLUG.git next
