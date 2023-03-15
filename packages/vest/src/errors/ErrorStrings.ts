export enum ErrorStrings {
  HOOK_CALLED_OUTSIDE = 'hook called outside of a running suite.',
  EXPECTED_VEST_TEST = 'Expected value to be an instance of IsolateTest',
  FIELD_NAME_REQUIRED = 'Field name must be passed',
  SUITE_MUST_BE_INITIALIZED_WITH_FUNCTION = 'Suite must be initialized with a function',
  NO_ACTIVE_ISOLATE = 'Not within an active isolate',
  PROMISIFY_REQUIRE_FUNCTION = 'Vest.Promisify must be called with a function',
  PARSER_EXPECT_RESULT_OBJECT = "Vest parser: expected argument at position 0 to be Vest's result object.",
  WARN_MUST_BE_CALLED_FROM_TEST = 'Warn must be called from within the body of a test function',
  EACH_CALLBACK_MUST_BE_A_FUNCTION = 'Each must be called with a function',
}
