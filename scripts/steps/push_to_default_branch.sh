git config --global user.email $EMAIL_ADDRESS --replace-all
git config --global user.name $GIT_NAME

echo "Deleting local branch"
git branch -D $DEFAULT_BRANCH

echo "Checking out new local branch"
git checkout -b $DEFAULT_BRANCH

echo "Commiting"
git add .
git commit -m "$1" -m "$2"

echo "Pushing to $DEFAULT_BRANCH"
git push https://$GITHUB_TOKEN@github.com/$TRAVIS_REPO_SLUG.git $DEFAULT_BRANCH

echo "Trying to update next branch"
git fetch origin $NEXT_BRANCH

git checkout $NEXT_BRANCH
git rebase $DEFAULT_BRANCH || git rebase --abort

git push https://$GITHUB_TOKEN@github.com/$TRAVIS_REPO_SLUG.git $NEXT_BRANCH