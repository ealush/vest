export const dump = {
  children: [
    {
      children: null,
      $type: 'Test',
      data: {
        severity: 'error',
        status: 'FAILED',
        fieldName: 't1',
      },
      key: null,
    },
    {
      children: [
        {
          children: null,
          $type: 'Test',
          data: {
            severity: 'error',
            status: 'FAILED',
            fieldName: 't2',
            groupName: 'g1',
            message: 't2 message',
          },
          key: null,
        },
        {
          children: null,
          $type: 'Test',
          data: {
            severity: 'error',
            status: 'PASSING',
            fieldName: 't3',
            groupName: 'g1',
            message: 't3 message',
          },
          key: null,
        },
        {
          children: null,
          $type: 'Test',
          data: {
            severity: 'warning',
            status: 'WARNING',
            fieldName: 't4',
            groupName: 'g1',
          },
          key: null,
        },
      ],
      $type: 'Group',
      key: null,
    },
    {
      children: [
        {
          children: null,
          $type: 'Focused',
          data: {
            focusMode: 1,
            match: [],
            matchAll: true,
          },
          key: null,
        },
        {
          children: null,
          $type: 'Test',
          data: {
            severity: 'error',
            status: 'SKIPPED',
            fieldName: 't5',
          },
          key: 'key1',
        },
      ],
      $type: 'Group',
      key: null,
    },
    {
      children: [
        {
          children: null,
          $type: 'Test',
          data: {
            severity: 'error',
            status: 'FAILED',
            fieldName: 't6',
          },
          key: 'a',
        },
        {
          children: null,
          $type: 'Test',
          data: {
            severity: 'error',
            status: 'FAILED',
            fieldName: 't6',
          },
          key: 'b',
        },
      ],
      $type: 'Each',
      allowReorder: true,
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
