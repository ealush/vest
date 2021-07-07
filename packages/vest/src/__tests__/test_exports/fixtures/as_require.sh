cd _test_exports

node --input-type=$1 --eval "
  const vest = require('vest');
  const {test, enforce} = vest;

  const validate = vest.create( () => {

    test('field_name', 'should fail', () => {
      enforce(1).equals(2);
    });
  });

validate();
"