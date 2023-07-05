import { CB } from 'vest-utils';

import * as vest from 'vest';

enum Fields {
  F1 = 'F1',
  F2 = 'F2',
  F3 = 'F3',
  F4 = 'F4',
}

function testSuite(callback: CB) {
  return vest.staticSuite(callback)();
}

describe('Top Level Focus', () => {
  describe('Top Level Skip', () => {
    describe('Single field', () => {
      it('Should skip fields under `skip`', () => {
        const result = testSuite(() => {
          vest.skip(Fields.F1);

          vest.test(Fields.F1, 'F1 error', () => false);
          vest.test(Fields.F2, 'F2 error', () => false);
        });
        expect(result.hasErrors(Fields.F1)).toBe(false);
        expect(result.hasErrors(Fields.F2)).toBe(true);
        expect(result.testCount).toBe(1);
        expect(result.errorCount).toBe(1);
        expect(result.tests.F1.errorCount).toBe(0);
        expect(result.tests.F2.errorCount).toBe(1);
        expect(result.tests.F1.testCount).toBe(0);
        expect(result.tests.F2.testCount).toBe(1);
      });
    });

    describe('Multiple Fields', () => {
      it('Should skip fields under `skip`', () => {
        const result = testSuite(() => {
          vest.skip([Fields.F1, Fields.F2]);

          vest.test(Fields.F1, 'F1 error', () => false);
          vest.test(Fields.F2, 'F2 error', () => false);
          vest.test(Fields.F3, 'F3 error', () => false);
        });
        expect(result.hasErrors(Fields.F1)).toBe(false);
        expect(result.hasErrors(Fields.F2)).toBe(false);
        expect(result.hasErrors(Fields.F3)).toBe(true);
        expect(result.testCount).toBe(1);
        expect(result.errorCount).toBe(1);
        expect(result.tests.F1.errorCount).toBe(0);
        expect(result.tests.F2.errorCount).toBe(0);
        expect(result.tests.F3.errorCount).toBe(1);
        expect(result.tests.F1.testCount).toBe(0);
        expect(result.tests.F2.testCount).toBe(0);
        expect(result.tests.F3.testCount).toBe(1);
      });
    });

    describe('Multiple Skip Calls', () => {
      it('Should skip fields under `skip`', () => {
        const result = testSuite(() => {
          vest.skip(Fields.F1);
          vest.skip(Fields.F2);

          vest.test(Fields.F1, 'F1 error', () => false);
          vest.test(Fields.F2, 'F2 error', () => false);
          vest.test(Fields.F3, 'F3 error', () => false);
        });
        expect(result.hasErrors(Fields.F1)).toBe(false);
        expect(result.hasErrors(Fields.F2)).toBe(false);
        expect(result.hasErrors(Fields.F3)).toBe(true);
        expect(result.testCount).toBe(1);
        expect(result.errorCount).toBe(1);
        expect(result.tests.F1.errorCount).toBe(0);
        expect(result.tests.F2.errorCount).toBe(0);
        expect(result.tests.F3.errorCount).toBe(1);
        expect(result.tests.F1.testCount).toBe(0);
        expect(result.tests.F2.testCount).toBe(0);
        expect(result.tests.F3.testCount).toBe(1);
      });
    });

    describe('Nonexistent Field', () => {
      it('Should ignore nonexistent fields', () => {
        const result = testSuite(() => {
          vest.skip(Fields.F1);

          vest.test(Fields.F2, 'F2 error', () => false);
          vest.test(Fields.F3, 'F3 error', () => false);
        });
        expect(result.hasErrors(Fields.F1)).toBe(false);
        expect(result.hasErrors(Fields.F2)).toBe(true);
        expect(result.hasErrors(Fields.F3)).toBe(true);
        expect(result.testCount).toBe(2);
        expect(result.errorCount).toBe(2);
        expect(result.tests.F1).toBeUndefined();
        expect(result.tests.F2.errorCount).toBe(1);
        expect(result.tests.F3.errorCount).toBe(1);
        expect(result.tests.F2.testCount).toBe(1);
        expect(result.tests.F3.testCount).toBe(1);
      });
    });

    describe('Empty skip call', () => {
      it('Should ignore skip call', () => {
        const result = testSuite(() => {
          vest.skip();

          vest.test(Fields.F1, 'F1 error', () => false);
          vest.test(Fields.F2, 'F2 error', () => false);
        });
        expect(result.hasErrors(Fields.F1)).toBe(true);
        expect(result.hasErrors(Fields.F2)).toBe(true);
        expect(result.testCount).toBe(2);
        expect(result.errorCount).toBe(2);
        expect(result.tests.F1.errorCount).toBe(1);
        expect(result.tests.F2.errorCount).toBe(1);
        expect(result.tests.F1.testCount).toBe(1);
        expect(result.tests.F2.testCount).toBe(1);
      });
    });
  });

  describe('Top Level Only', () => {
    describe('Single field', () => {
      it('Should only run fields under `only`', () => {
        const result = testSuite(() => {
          vest.only(Fields.F1);

          vest.test(Fields.F1, 'F1 error', () => false);
          vest.test(Fields.F2, 'F2 error', () => false);
        });
        expect(result.hasErrors(Fields.F1)).toBe(true);
        expect(result.hasErrors(Fields.F2)).toBe(false);
        expect(result.testCount).toBe(1);
        expect(result.errorCount).toBe(1);
        expect(result.tests.F1.errorCount).toBe(1);
        expect(result.tests.F2.errorCount).toBe(0);
        expect(result.tests.F1.testCount).toBe(1);
        expect(result.tests.F2.testCount).toBe(0);
      });
    });

    describe('Multiple Fields', () => {
      it('Should only run fields under `only`', () => {
        const result = testSuite(() => {
          vest.only([Fields.F1, Fields.F2]);

          vest.test(Fields.F1, 'F1 error', () => false);
          vest.test(Fields.F2, 'F2 error', () => false);
          vest.test(Fields.F3, 'F3 error', () => false);
        });
        expect(result.hasErrors(Fields.F1)).toBe(true);
        expect(result.hasErrors(Fields.F2)).toBe(true);
        expect(result.hasErrors(Fields.F3)).toBe(false);
        expect(result.testCount).toBe(2);
        expect(result.errorCount).toBe(2);
        expect(result.tests.F1.errorCount).toBe(1);
        expect(result.tests.F2.errorCount).toBe(1);
        expect(result.tests.F3.errorCount).toBe(0);
        expect(result.tests.F1.testCount).toBe(1);
        expect(result.tests.F2.testCount).toBe(1);
        expect(result.tests.F3.testCount).toBe(0);
      });
    });

    describe('Multiple Only Calls', () => {
      it('Should only run fields under `only`', () => {
        const result = testSuite(() => {
          vest.only(Fields.F1);
          vest.only(Fields.F2);

          vest.test(Fields.F1, 'F1 error', () => false);
          vest.test(Fields.F2, 'F2 error', () => false);
          vest.test(Fields.F3, 'F3 error', () => false);
        });
        expect(result.hasErrors(Fields.F1)).toBe(true);
        expect(result.hasErrors(Fields.F2)).toBe(true);
        expect(result.hasErrors(Fields.F3)).toBe(false);
        expect(result.testCount).toBe(2);
        expect(result.errorCount).toBe(2);
        expect(result.tests.F1.errorCount).toBe(1);
        expect(result.tests.F2.errorCount).toBe(1);
        expect(result.tests.F3.errorCount).toBe(0);
        expect(result.tests.F1.testCount).toBe(1);
        expect(result.tests.F2.testCount).toBe(1);
        expect(result.tests.F3.testCount).toBe(0);
      });
    });

    describe('Nonexistent Field', () => {
      it('Should ignore all other fields', () => {
        const result = testSuite(() => {
          vest.only(Fields.F1);

          vest.test(Fields.F2, 'F2 error', () => false);
          vest.test(Fields.F3, 'F3 error', () => false);
        });
        expect(result.hasErrors(Fields.F1)).toBe(false);
        expect(result.hasErrors(Fields.F2)).toBe(false);
        expect(result.hasErrors(Fields.F3)).toBe(false);

        expect(result.testCount).toBe(0);
        expect(result.errorCount).toBe(0);
        expect(result.tests.F1).toBeUndefined();
        expect(result.tests.F2.testCount).toBe(0);
        expect(result.tests.F3.testCount).toBe(0);
      });
    });
  });
});

describe('Scoped Focus', () => {
  describe('Only', () => {
    it('Should apply only to the current scope', () => {
      const result = testSuite(() => {
        vest.group('Group', () => {
          vest.only(Fields.F2);

          vest.test(Fields.F1, 'F1 error', () => false);
          vest.test(Fields.F2, 'F2 error', () => false);
          vest.test(Fields.F3, 'F3 error', () => false);
        });

        vest.test(Fields.F4, 'F4 error', () => false);
      });

      expect(result.hasErrors(Fields.F1)).toBe(false);
      expect(result.hasErrors(Fields.F2)).toBe(true);
      expect(result.hasErrors(Fields.F3)).toBe(false);
      expect(result.hasErrors(Fields.F4)).toBe(true);
      expect(result.tests.F1.testCount).toBe(0);
      expect(result.tests.F2.testCount).toBe(1);
      expect(result.tests.F3.testCount).toBe(0);
    });

    describe('When there are tests of the same field outside of the scope', () => {
      it('Should only apply within the scope', () => {
        const result = testSuite(() => {
          vest.mode(vest.Modes.ALL); // This shows us that the test actually run outside of the scope
          vest.group('Group', () => {
            vest.only(Fields.F2);

            vest.test(Fields.F1, 'F1 error', () => false);
            vest.test(Fields.F2, 'F2 error', () => false);
            vest.test(Fields.F3, 'F3 error', () => false);
          });

          vest.test(Fields.F1, 'F1 2nd error', () => false);
          vest.test(Fields.F2, 'F2 2nd error', () => false);
          vest.test(Fields.F3, 'F3 2nd error', () => false);
        });
        expect(result.hasErrors(Fields.F1)).toBe(true);
        expect(result.hasErrors(Fields.F2)).toBe(true);
        expect(result.hasErrors(Fields.F3)).toBe(true);
        expect(result.tests.F1.testCount).toBe(1);
        expect(result.tests.F2.testCount).toBe(2);
        expect(result.tests.F3.testCount).toBe(1);
      });
    });
  });

  describe('Skip', () => {
    it('Should apply only to the current scope', () => {
      const result = testSuite(() => {
        vest.group('Group', () => {
          vest.skip(Fields.F2);

          vest.test(Fields.F1, 'F1 error', () => false);
          vest.test(Fields.F2, 'F2 error', () => false);
          vest.test(Fields.F3, 'F3 error', () => false);
        });

        vest.test(Fields.F4, 'F4 error', () => false);
      });

      expect(result.hasErrors(Fields.F1)).toBe(true);
      expect(result.hasErrors(Fields.F2)).toBe(false);
      expect(result.hasErrors(Fields.F3)).toBe(true);
      expect(result.hasErrors(Fields.F4)).toBe(true);
      expect(result.tests.F1.testCount).toBe(1);
      expect(result.tests.F2.testCount).toBe(0);
      expect(result.tests.F3.testCount).toBe(1);
      expect(result.tests.F4.testCount).toBe(1);
    });

    describe('When there are tests of the same field outside of the scope', () => {
      it('Should only apply within the scope', () => {
        const result = testSuite(() => {
          vest.mode(vest.Modes.ALL); // This shows us that the tests actually run outside of the scope
          vest.group('Group', () => {
            vest.skip(Fields.F2);

            vest.test(Fields.F1, 'F1 error', () => false);
            vest.test(Fields.F2, 'F2 error', () => false);
            vest.test(Fields.F3, 'F3 error', () => false);
          });

          vest.test(Fields.F1, 'F1 2nd error', () => false);
          vest.test(Fields.F2, 'F2 2nd error', () => false);
          vest.test(Fields.F3, 'F3 2nd error', () => false);
        });
        expect(result.hasErrors(Fields.F1)).toBe(true);
        expect(result.hasErrors(Fields.F2)).toBe(true);
        expect(result.hasErrors(Fields.F3)).toBe(true);
        expect(result.tests.F1.testCount).toBe(2);
        expect(result.tests.F2.testCount).toBe(1);
        expect(result.tests.F3.testCount).toBe(2);
      });
    });
  });

  describe('Only and Skip', () => {
    it('Should apply only to the current scope', () => {
      const result = testSuite(() => {
        vest.group('Group', () => {
          vest.only(Fields.F2);
          vest.skip(Fields.F3);

          vest.test(Fields.F1, 'F1 error', () => false);
          vest.test(Fields.F2, 'F2 error', () => false);
          vest.test(Fields.F3, 'F3 error', () => false);
        });

        vest.test(Fields.F4, 'F4 error', () => false);
      });

      expect(result.hasErrors(Fields.F1)).toBe(false);
      expect(result.hasErrors(Fields.F2)).toBe(true);
      expect(result.hasErrors(Fields.F3)).toBe(false);
      expect(result.hasErrors(Fields.F4)).toBe(true);
      expect(result.tests.F1.testCount).toBe(0);
      expect(result.tests.F2.testCount).toBe(1);
      expect(result.tests.F3.testCount).toBe(0);
      expect(result.tests.F4.testCount).toBe(1);
    });

    describe('When there are tests of the same field outside of the scope', () => {
      it('Should only apply within the scope', () => {
        const result = testSuite(() => {
          vest.mode(vest.Modes.ALL); // This shows us that the tests actually run outside of the scope
          vest.group('Group', () => {
            vest.only(Fields.F2);
            vest.skip(Fields.F3);

            vest.test(Fields.F1, 'F1 error', () => false);
            vest.test(Fields.F2, 'F2 error', () => false);
            vest.test(Fields.F3, 'F3 error', () => false);
          });

          vest.test(Fields.F1, 'F1 2nd error', () => false);
          vest.test(Fields.F2, 'F2 2nd error', () => false);
          vest.test(Fields.F3, 'F3 2nd error', () => false);
        });
        expect(result.hasErrors(Fields.F1)).toBe(true);
        expect(result.hasErrors(Fields.F2)).toBe(true);
        expect(result.hasErrors(Fields.F3)).toBe(true);
        expect(result.tests.F1.testCount).toBe(1);
        expect(result.tests.F2.testCount).toBe(2);
        expect(result.tests.F3.testCount).toBe(1);
      });
    });
  });
});

describe('Multiple scopes', () => {
  describe('Top and lower level scopes', () => {
    describe('only>skip', () => {
      it('Should include the field globally but skip in the scope', () => {
        const result = testSuite(() => {
          vest.mode(vest.Modes.ALL); // This shows us that the tests actually run outside of the scope

          vest.only(Fields.F1);
          vest.test(Fields.F1, 'F1 1st error', () => false);
          vest.test(Fields.F2, 'F2 1st error', () => false);
          vest.group('Group', () => {
            vest.skip(Fields.F1);
            vest.test(Fields.F1, 'F1 2nd error', () => false);
            vest.test(Fields.F2, 'F2 2nd error', () => false);
          });
          vest.test(Fields.F1, 'F1 3rd error', () => false);
          vest.test(Fields.F2, 'F2 3rd error', () => false);
        });
        expect(result.hasErrors(Fields.F1)).toBe(true);
        expect(result.hasErrors(Fields.F2)).toBe(false);
        expect(result.tests.F1.testCount).toBe(2);
        expect(result.tests.F1.testCount).toBe(2);
        expect(result.groups.Group.F1.testCount).toBe(0);
        expect(result.tests.F2.testCount).toBe(0);
        expect(result.tests.F2.testCount).toBe(0);
      });
    });

    describe('skip>only', () => {
      it('Should skip the field globally and include it in the scope', () => {
        const result = testSuite(() => {
          vest.mode(vest.Modes.ALL); // This shows us that the tests actually run outside of the scope

          vest.skip(Fields.F1);
          vest.test(Fields.F1, 'F1 1st error', () => false);
          vest.test(Fields.F2, 'F2 1st error', () => false);
          vest.group('Group', () => {
            vest.only(Fields.F1);
            vest.test(Fields.F1, 'F1 2nd error', () => false);
            vest.test(Fields.F2, 'F2 2nd error', () => false);
          });
          vest.test(Fields.F1, 'F1 3rd error', () => false);
          vest.test(Fields.F2, 'F2 3rd error', () => false);
        });
        expect(result.hasErrors(Fields.F1)).toBe(true);
        expect(result.hasErrors(Fields.F2)).toBe(true);
        expect(result.tests.F1.testCount).toBe(1);
        expect(result.groups.Group.F1.testCount).toBe(1);
        expect(result.tests.F2.testCount).toBe(2);
        expect(result.groups.Group.F2.testCount).toBe(0);
      });
    });
  });
});

describe('skip(true)', () => {
  it('Should skip all tests within the current scope and its children', () => {
    const result = testSuite(() => {
      vest.mode(vest.Modes.ALL); // This shows us that the tests actually run outside of the scope

      vest.skip(true);
      vest.test(Fields.F1, 'F1 1st error', () => false);
      vest.test(Fields.F2, 'F2 1st error', () => false);
      vest.group('Group', () => {
        vest.test(Fields.F1, 'F1 2nd error', () => false);
        vest.test(Fields.F2, 'F2 2nd error', () => false);
      });
      vest.test(Fields.F1, 'F1 3rd error', () => false);
      vest.test(Fields.F2, 'F2 3rd error', () => false);
    });
    expect(result.hasErrors(Fields.F1)).toBe(false);
    expect(result.hasErrors(Fields.F2)).toBe(false);
    expect(result.tests.F1.testCount).toBe(0);
    expect(result.tests.F2.testCount).toBe(0);
    expect(result.groups.Group.F1.testCount).toBe(0);
    expect(result.groups.Group.F2.testCount).toBe(0);
  });
});
