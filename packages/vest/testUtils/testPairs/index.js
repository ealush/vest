import { ALL_VEST_BUILDS } from '../vestBuilds';

export default ALL_VEST_BUILDS.reduce(
  (pairs, { validate }) => [
    ...pairs,
    ...ALL_VEST_BUILDS.map(({ test }) => [validate, test]),
  ],
  []
);
