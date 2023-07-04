export enum ErrorStrings {
  HOOK_CALLED_OUTSIDE = 'hook called outside of a running suite.',
  EXPECTED_VEST_TEST = 'Expected value to be an instance of IsolateTest',
  FIELD_NAME_REQUIRED = 'Field name must be passed',
  SUITE_MUST_BE_INITIALIZED_WITH_FUNCTION = 'Suite must be initialized with a function',
  PROMISIFY_REQUIRE_FUNCTION = 'Vest.Promisify must be called with a function',
  PARSER_EXPECT_RESULT_OBJECT = "Vest parser: expected argument at position 0 to be Vest's result object.",
  WARN_MUST_BE_CALLED_FROM_TEST = 'Warn must be called from within the body of a test function',
  EACH_CALLBACK_MUST_BE_A_FUNCTION = 'Each must be called with a function',
  INVALID_PARAM_PASSED_TO_FUNCTION = 'Incompatible params passed to {fn_name} function. "{param}" must be of type {expected}',
  TESTS_CALLED_IN_DIFFERENT_ORDER = `Vest Critical Error: Tests called in different order than previous run.
    expected: {fieldName}
    received: {prevName}
    This can happen on one of two reasons:
    1. You're using if/else statements to conditionally select tests. Instead, use "skipWhen".
    2. You are iterating over a list of tests, and their order changed. Use "each" and a custom key prop so that Vest retains their state.`,
  UNEXPECTED_TEST_REGISTRATION_ERROR = `Unexpected error encountered during test registration.
      Please report this issue to Vest's Github repository.
      Test Object: {testObject}.
      Error: {error}.`,
  UNEXPECTED_TEST_RUN_ERROR = `Unexpected error encountered during test run. Please report this issue to Vest's Github repository.
      Test Object: {testObject}.`,
  INCLUDE_SELF = 'Trying to call include.when on the same field.',
}
