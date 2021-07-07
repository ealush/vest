cd _test_exports

node --input-type=$1 --eval "
  import { test, enforce, create } from 'vest/$2';

  const validate = create(() => {

    test('field_name', 'should fail', () => {
      enforce(1).equals(2);
    });
  });

validate();
"