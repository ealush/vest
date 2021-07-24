import loose from 'loose';
import shape from 'shape';

export default function schema() {
  return { shape, loose };
}

export type TSchema = ReturnType<typeof schema>;
