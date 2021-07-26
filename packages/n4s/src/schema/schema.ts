import isArrayOf from 'isArrayOf';
import loose from 'loose';
import shape from 'shape';

export default function schema() {
  return { shape, loose, isArrayOf };
}
