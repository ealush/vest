cd _test_exports

node --input-type=$1 --eval "
  const vest = require('vest/$2');
  const { test, enforce } = vest;

  const validate = vest.create('import_test', () => {

    test('field_name', 'should fail', () => {
      enforce(1).equals(2);
    });
  });

validate();
"