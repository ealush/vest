echo "Script: handle_changes"

echo "Getting diff"
export COMMIT_MESSAGES=$(node ./scripts/get_diff.js)

echo "Commit message is:"
echo $COMMIT_MESSAGES

echo "Getting next version"
export NEXT_VERSION=$(node ./scripts/get_next_version.js "$COMMIT_MESSAGES")

echo "Next version is:"
echo $NEXT_VERSION
