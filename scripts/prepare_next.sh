echo "Preparing next tag"

npm version "${NEXT_VERSION}-next-${TRAVIS_COMMIT:(0):6}" --no-git-tag
