import { bench, describe } from 'vitest';

import { TFieldName, TGroupName } from '../src/suiteResult/SuiteResultTypes';
import {
  Modes,
  create,
  each,
  enforce,
  group,
  include,
  mode,
  omitWhen,
  optional,
  skip,
  skipWhen,
  test,
  warn,
} from '../src/vest';

type EnforceData = {
  num: number;
  small: number;
  text: string;
  arr: number[];
  start: string;
  end: string;
  tags: string[];
};

const enforceMatrixSuite = create((data: EnforceData) => {
  mode(Modes.ALL);
  optional('optional_block' as TFieldName);

  test('numbers' as TFieldName, () => {
    enforce(data.num)
      .isNumber()
      .greaterThan(data.small)
      .lessThan(data.num + 1_000);
    enforce(data.small).isNumber().greaterThan(-100);
  });

  test('strings' as TFieldName, () => {
    enforce(data.text)
      .isString()
      .matches(/^[a-z0-9 ]+$/i)
      .longerThan(3)
      .shorterThan(50)
      .startsWith(data.start)
      .endsWith(data.end);
  });

  test('array' as TFieldName, () => {
    enforce(data.arr).isArray().shorterThanOrEquals(100);
    enforce.isArrayOf(enforce.isNumber()).test(data.arr);
  });

  test('tags' as TFieldName, () => {
    enforce.isArrayOf(enforce.isString().longerThan(2)).test(data.tags);
  });

  test('warned' as TFieldName, () => {
    warn();
    enforce(data.num).greaterThan(0);
  });
});

type FlowData = {
  fields: string[];
  runConditional: boolean;
};

const createFlowSuite = (label: string) =>
  create((data: FlowData) => {
    mode(label === 'one' ? Modes.ONE : Modes.EAGER);
    include('conditional' as TFieldName).when(() => data.runConditional);
    skip((data.runConditional ? undefined : 'skipped_static') as TFieldName);
    optional('optional_flow' as TFieldName);

    group(`flow_${label}` as TGroupName, () => {
      each(data.fields, (field, index) => {
        test(
          `field_${label}_${field}` as TFieldName,
          () => {
            enforce(index)
              .isNumber()
              .lessThan(data.fields.length + 5);
          },
          field,
        );
      });

      skipWhen(!data.runConditional, () => {
        test(`conditional_${label}` as TFieldName, () => {
          enforce(data.fields.length).greaterThan(0);
        });
      });

      omitWhen(data.fields.length > 5, () => {
        test(`omitted_${label}` as TFieldName, () => {
          enforce(data.fields.length).lessThan(6);
        });
      });
    });
  });

const dataSmall: EnforceData = {
  arr: [1, 2, 3, 4, 5],
  end: '8',
  num: 128,
  small: 12,
  start: 'u',
  tags: ['alpha', 'beta', 'gamma'],
  text: 'user_name_128',
};

const dataLarge: EnforceData = {
  arr: Array.from({ length: 32 }, (_, i) => i * 2),
  end: '6',
  num: 9876,
  small: 321,
  start: 'p',
  tags: ['delta', 'epsilon', 'zeta', 'theta'],
  text: 'payload_value_9876',
};

const flowDataSmall: FlowData = {
  fields: ['email', 'name', 'zip'],
  runConditional: true,
};

const flowDataWide: FlowData = {
  fields: Array.from({ length: 12 }, (_, i) => `field_${i}`),
  runConditional: false,
};

const flowEager = createFlowSuite('eager');
const flowOne = createFlowSuite('one');

function runEnforceMatrix(
  suite: typeof enforceMatrixSuite,
  iterations: number,
  data: EnforceData,
): void {
  for (let i = 0; i < iterations; i++) {
    suite.run(data);
  }
}

function runFlowSuite(
  suite: ReturnType<typeof createFlowSuite>,
  iterations: number,
  data: FlowData,
): void {
  for (let i = 0; i < iterations; i++) {
    suite.run(data);
  }
}

describe('Feature Coverage Matrix', () => {
  bench(
    'enforce matrix (small payload)',
    () => {
      runEnforceMatrix(enforceMatrixSuite, 5, dataSmall);
    },
    { time: 250 },
  );

  bench(
    'enforce matrix (larger payload)',
    () => {
      runEnforceMatrix(enforceMatrixSuite, 3, dataLarge);
    },
    { time: 250 },
  );

  bench(
    'flow control eager mode',
    () => {
      runFlowSuite(flowEager, 6, flowDataSmall);
    },
    { time: 200 },
  );

  bench(
    'flow control one mode',
    () => {
      runFlowSuite(flowOne, 4, flowDataWide);
    },
    { time: 200 },
  );
});
