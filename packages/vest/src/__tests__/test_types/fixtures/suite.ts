import promisify from 'vest/promisify';

import vest from 'vest';

vest.create('suite_name', () => {});
vest.create(() => {});
vest.create(() => {
  vest.only('str');
  vest.only.group('str');
  vest.skip('str');
  vest.skip.group('str');
  vest.only(['str']);
  vest.only.group(['str']);
  vest.skip(['str']);
  vest.skip.group(['str']);
});

const v = vest.create(() => {});

const validateResult = v({}, {}, {});

validateResult.name;
validateResult.errorCount;
validateResult.warnCount;
validateResult.testCount;
validateResult.tests.someField;
validateResult.tests.someField.errorCount;
validateResult.tests.someField.warnCount;
validateResult.tests.someField.testCount;
validateResult.tests.someField.errors[0];
validateResult.tests.someField.warnings[0];

validateResult.hasErrors();
validateResult.getErrors();
validateResult.hasErrors('fieldName');
validateResult.getErrors('fieldName');
validateResult.hasWarnings();
validateResult.getWarnings();
validateResult.hasWarnings('fieldName');
validateResult.getWarnings('fieldName');
validateResult.hasErrorsByGroup('groupName');
validateResult.getErrorsByGroup('groupName');
validateResult.hasWarningsByGroup('groupName');
validateResult.getWarningsByGroup('groupName');
validateResult.done('fieldName', () => {});
validateResult.done(() => {});
validateResult.done('fieldName', res => {
  res.hasErrors();
  res.getErrors();
  res.hasErrors('fieldName');
  res.getErrors('fieldName');
  res.hasWarnings();
  res.getWarnings();
  res.hasWarnings('fieldName');
  res.getWarnings('fieldName');
  res.hasErrorsByGroup('groupName');
  res.getErrorsByGroup('groupName');
  res.hasWarningsByGroup('groupName');
  res.getWarningsByGroup('groupName');
  res.name;
  res.errorCount;
  res.warnCount;
  res.testCount;
  res.tests.someField;
  res.tests.someField.errorCount;
  res.tests.someField.warnCount;
  res.tests.someField.testCount;
  res.tests.someField.errors[0];
  res.tests.someField.warnings[0];
});

v.reset();
const getResult = v.get();
getResult.hasErrors();
getResult.getErrors();
getResult.hasErrors('fieldName');
getResult.getErrors('fieldName');
getResult.hasWarnings();
getResult.getWarnings();
getResult.hasWarnings('fieldName');
getResult.getWarnings('fieldName');
getResult.hasErrorsByGroup('groupName');
getResult.getErrorsByGroup('groupName');
getResult.hasWarningsByGroup('groupName');
getResult.getWarningsByGroup('groupName');
getResult.name;
getResult.errorCount;
getResult.warnCount;
getResult.testCount;
getResult.tests.someField;
getResult.tests.someField.errorCount;
getResult.tests.someField.warnCount;
getResult.tests.someField.testCount;
getResult.tests.someField.errors[0];
getResult.tests.someField.warnings[0];

const promisified = promisify(v);

promisified({}).then(() => {});
