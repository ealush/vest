git config --global user.email "${EMAIL_ADDRESS}" --replace-all
git config --global user.name $GIT_NAME

echo "Trying to update next branch"
git checkout next
git rebase master || git rebase --abort
git push https://${GITHUB_TOKEN}@github.com/$TRAVIS_REPO_SLUG.git next
