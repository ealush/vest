import { TIsolate } from 'vestjs-runtime';
import { TFieldName } from '../../suiteResult/SuiteResultTypes';
import { Failure } from 'vest-utils';

export type Events = {
  TEST_RUN_STARTED: void;
  TEST_COMPLETED: TIsolate;
  ALL_RUNNING_TESTS_FINISHED: void;
  REMOVE_FIELD: TFieldName;
  RESET_FIELD: TFieldName;
  RESET_SUITE: void;
  SUITE_RUN_STARTED: void;
  SUITE_CALLBACK_RUN_FINISHED: void;
  DONE_TEST_OMISSION_PASS: void;
  INITIALIZING_CALLBACKS: void;
  DEFER_THROW: Failure<any, any>;
};
