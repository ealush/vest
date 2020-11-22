cd _test_exports

node --input-type=$1 --eval "
  import vest, { test, enforce } from 'vest/$2';

  const validate = vest.create('import_test', () => {

    test('field_name', 'should fail', () => {
      enforce(1).equals(2);
    });
  });

validate();
"