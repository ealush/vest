export const dump = {
  children: [
    {
      $type: 'Test',
      children: null,
      data: {
        severity: 'error',
        fieldName: 't1',
      },
      key: null,
      status: 'FAILED',
    },
    {
      children: [
        {
          $type: 'Test',
          children: null,
          data: {
            fieldName: 't2',
            groupName: 'g1',
            message: 't2 message',
            severity: 'error',
          },
          key: null,
          status: 'FAILED',
        },
        {
          $type: 'Test',
          children: null,
          data: {
            fieldName: 't3',
            groupName: 'g1',
            message: 't3 message',
            severity: 'error',
          },
          key: null,
          status: 'PASSING',
        },
        {
          $type: 'Test',
          children: null,
          data: {
            severity: 'warning',
            fieldName: 't4',
            groupName: 'g1',
          },
          key: null,
          status: 'WARNING',
        },
      ],
      $type: 'Group',
      key: null,
    },
    {
      children: [
        {
          $type: 'Focused',
          children: null,
          data: {
            focusMode: 1,
            match: [],
            matchAll: true,
          },
          key: null,
        },
        {
          $type: 'Test',
          children: null,
          data: {
            severity: 'error',
            fieldName: 't5',
          },
          key: 'key1',
          status: 'SKIPPED',
        },
      ],
      $type: 'Group',
      key: null,
    },
    {
      $type: 'Each',
      allowReorder: true,
      children: [
        {
          $type: 'Test',
          children: null,
          data: {
            severity: 'error',
            fieldName: 't6',
          },
          key: 'a',
          status: 'FAILED',
        },
        {
          $type: 'Test',
          children: null,
          data: {
            severity: 'error',
            fieldName: 't6',
          },
          key: 'b',
          status: 'FAILED',
        },
      ],
      key: null,
    },
  ],
  output: {
    errorCount: 4,
    warnCount: 1,
    testCount: 6,
    errors: [
      { fieldName: 't1' },
      { fieldName: 't2', message: 't2 message', groupName: 'g1' },
      { fieldName: 't6' },
      { fieldName: 't6' },
    ],
    warnings: [{ fieldName: 't4', groupName: 'g1' }],
    groups: {
      g1: {
        t2: {
          errorCount: 1,
          warnCount: 0,
          testCount: 1,
          errors: ['t2 message'],
          warnings: [],
          valid: false,
        },
        t3: {
          errorCount: 0,
          warnCount: 0,
          testCount: 1,
          errors: [],
          warnings: [],
          valid: true,
        },
        t4: {
          errorCount: 0,
          warnCount: 1,
          testCount: 1,
          errors: [],
          warnings: [],
          valid: true,
        },
      },
    },
    tests: {
      t1: {
        errorCount: 1,
        warnCount: 0,
        testCount: 1,
        errors: [],
        warnings: [],
        valid: false,
      },
      t2: {
        errorCount: 1,
        warnCount: 0,
        testCount: 1,
        errors: ['t2 message'],
        warnings: [],
        valid: false,
      },
      t3: {
        errorCount: 0,
        warnCount: 0,
        testCount: 1,
        errors: [],
        warnings: [],
        valid: true,
      },
      t4: {
        errorCount: 0,
        warnCount: 1,
        testCount: 1,
        errors: [],
        warnings: [],
        valid: true,
      },
      t5: {
        errorCount: 0,
        warnCount: 0,
        testCount: 0,
        errors: [],
        warnings: [],
        valid: false,
      },
      t6: {
        errorCount: 2,
        warnCount: 0,
        testCount: 2,
        errors: [],
        warnings: [],
        valid: false,
      },
    },
    valid: false,
  },
  $type: 'Suite',
  data: {
    optional: {},
  },
  key: null,
};
