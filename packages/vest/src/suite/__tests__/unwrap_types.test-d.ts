import { enforce } from 'n4s';
import { create } from '../createSuite';
import { InferSchemaData } from '../../suiteResult/SuiteResultTypes';

const schema = enforce.shape({
  name: enforce.isString(),
  age: enforce.isNumber(),
});

type Schema = typeof schema;

// Current behavior:
type Inferred = InferSchemaData<Schema>;
// Should be: { name: string; age: number }
// Currently might be: ShapeType<{ name: StringRuleInstance; age: NumberRuleInstance }>

create(_data => {
  // Hovering over data should show { name: string; age: number }
  _data.name;
}, schema);
