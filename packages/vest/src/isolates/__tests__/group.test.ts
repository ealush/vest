import * as vest from 'vest';

enum GroupNames {
  G1 = 'g1',
  G2 = 'g2',
}

enum FieldNames {
  F1 = 'f1',
  F2 = 'f2',
  F3 = 'f3',
  F4 = 'f4',
}

describe('named group', () => {
  it('should run group callback', () => {
    const groupName = 'groupName';
    const callback = jest.fn();
    vest.create(() => {
      vest.group(groupName, callback);
    })();
    expect(callback).toHaveBeenCalled();
  });

  it('Should run the tests within the group', () => {
    const cb1 = jest.fn(() => false);
    const cb2 = jest.fn(() => false);
    const cb3 = jest.fn(() => {});
    const suite = vest.create(() => {
      vest.mode(vest.Modes.ALL);
      vest.test(FieldNames.F1, () => false);

      vest.group(GroupNames.G1, () => {
        vest.test(FieldNames.F1, cb1);
        vest.test(FieldNames.F2, cb2);
        vest.test(FieldNames.F3, cb3);
      });
    });

    const res = suite();
    expect(res.hasErrors(FieldNames.F1)).toBe(true);
    expect(res.hasErrors(FieldNames.F2)).toBe(true);
    expect(res.hasErrors(FieldNames.F3)).toBe(false);
    expect(res.hasErrorsByGroup(GroupNames.G1)).toBe(true);
    expect(res.hasErrorsByGroup(GroupNames.G1, FieldNames.F1)).toBe(true);
    expect(res.hasErrorsByGroup(GroupNames.G1, FieldNames.F2)).toBe(true);
    expect(res.hasErrorsByGroup(GroupNames.G1, FieldNames.F3)).toBe(false);
    expect(cb1).toHaveBeenCalled();
    expect(cb2).toHaveBeenCalled();
    expect(cb3).toHaveBeenCalled();
    expect(res.isValid()).toBe(false);
    expect(res.isValidByGroup(GroupNames.G1)).toBe(false);
    expect(res.isValidByGroup(GroupNames.G1, FieldNames.F1)).toBe(false);
    expect(res.isValidByGroup(GroupNames.G1, FieldNames.F2)).toBe(false);
    expect(res.isValidByGroup(GroupNames.G1, FieldNames.F3)).toBe(true);
    expect(res.tests[FieldNames.F1].testCount).toBe(2);
    expect(res.tests[FieldNames.F2].testCount).toBe(1);
    expect(res.tests[FieldNames.F3].testCount).toBe(1);
    expect(res.tests[FieldNames.F1].errorCount).toBe(2);
    expect(res.tests[FieldNames.F2].errorCount).toBe(1);
    expect(res.tests[FieldNames.F3].errorCount).toBe(0);
    expect(res.groups[GroupNames.G1][FieldNames.F1].errorCount).toBe(1);
    expect(res.groups[GroupNames.G1][FieldNames.F1].testCount).toBe(1);
    expect(res.groups[GroupNames.G1][FieldNames.F2].errorCount).toBe(1);
    expect(res.groups[GroupNames.G1][FieldNames.F2].testCount).toBe(1);
    expect(res.groups[GroupNames.G1][FieldNames.F3].errorCount).toBe(0);
    expect(res.groups[GroupNames.G1][FieldNames.F3].testCount).toBe(1);
    expect(suite.get()).toMatchSnapshot();
  });

  describe('Multiple groups', () => {
    it('Should run the tests within the groups', () => {
      const cb1 = jest.fn(() => false);
      const cb2 = jest.fn(() => false);
      const cb3 = jest.fn(() => {});
      const suite = vest.create(() => {
        vest.mode(vest.Modes.ALL);
        vest.test(FieldNames.F1, () => false);

        vest.group(GroupNames.G1, () => {
          vest.test(FieldNames.F1, cb1);
          vest.test(FieldNames.F2, cb2);
          vest.test(FieldNames.F3, cb3);
        });

        vest.group(GroupNames.G2, () => {
          vest.test(FieldNames.F1, cb1);
          vest.test(FieldNames.F2, cb2);
          vest.test(FieldNames.F3, cb3);
        });
      });

      const res = suite();
      expect(res.hasErrors(FieldNames.F1)).toBe(true);
      expect(res.hasErrors(FieldNames.F2)).toBe(true);
      expect(res.hasErrors(FieldNames.F3)).toBe(false);
      expect(res.hasErrorsByGroup(GroupNames.G1)).toBe(true);
      expect(res.hasErrorsByGroup(GroupNames.G1, FieldNames.F1)).toBe(true);
      expect(res.hasErrorsByGroup(GroupNames.G1, FieldNames.F2)).toBe(true);
      expect(res.hasErrorsByGroup(GroupNames.G1, FieldNames.F3)).toBe(false);
      expect(res.hasErrorsByGroup(GroupNames.G2)).toBe(true);
      expect(res.hasErrorsByGroup(GroupNames.G2, FieldNames.F1)).toBe(true);
      expect(res.hasErrorsByGroup(GroupNames.G2, FieldNames.F2)).toBe(true);
      expect(res.hasErrorsByGroup(GroupNames.G2, FieldNames.F3)).toBe(false);
      expect(cb1).toHaveBeenCalledTimes(2);
      expect(cb2).toHaveBeenCalledTimes(2);
      expect(cb3).toHaveBeenCalledTimes(2);
      expect(res.isValid()).toBe(false);
      expect(res.isValidByGroup(GroupNames.G1)).toBe(false);
      expect(res.isValidByGroup(GroupNames.G1, FieldNames.F1)).toBe(false);
      expect(res.isValidByGroup(GroupNames.G1, FieldNames.F2)).toBe(false);
      expect(res.isValidByGroup(GroupNames.G1, FieldNames.F3)).toBe(true);
      expect(res.isValidByGroup(GroupNames.G2)).toBe(false);

      expect(res.isValidByGroup(GroupNames.G2, FieldNames.F1)).toBe(false);
      expect(res.isValidByGroup(GroupNames.G2, FieldNames.F2)).toBe(false);
      expect(res.isValidByGroup(GroupNames.G2, FieldNames.F3)).toBe(true);
      expect(res.tests[FieldNames.F1].testCount).toBe(3);
      expect(res.tests[FieldNames.F2].testCount).toBe(2);
      expect(res.tests[FieldNames.F3].testCount).toBe(2);
      expect(res.tests[FieldNames.F1].errorCount).toBe(3);
      expect(res.tests[FieldNames.F2].errorCount).toBe(2);
      expect(res.tests[FieldNames.F3].errorCount).toBe(0);
      expect(res.groups[GroupNames.G1][FieldNames.F1].errorCount).toBe(1);
      expect(res.groups[GroupNames.G1][FieldNames.F1].testCount).toBe(1);
      expect(res.groups[GroupNames.G1][FieldNames.F2].errorCount).toBe(1);
      expect(res.groups[GroupNames.G1][FieldNames.F2].testCount).toBe(1);
      expect(res.groups[GroupNames.G1][FieldNames.F3].errorCount).toBe(0);
      expect(res.groups[GroupNames.G1][FieldNames.F3].testCount).toBe(1);
      expect(res.groups[GroupNames.G2][FieldNames.F1].errorCount).toBe(1);
      expect(res.groups[GroupNames.G2][FieldNames.F1].testCount).toBe(1);
      expect(res.groups[GroupNames.G2][FieldNames.F2].errorCount).toBe(1);
      expect(res.groups[GroupNames.G2][FieldNames.F2].testCount).toBe(1);
      expect(res.groups[GroupNames.G2][FieldNames.F3].errorCount).toBe(0);
      expect(res.groups[GroupNames.G2][FieldNames.F3].testCount).toBe(1);
      expect(suite.get()).toMatchSnapshot();
    });
  });

  describe('Focus', () => {
    describe('skip outside of group', () => {
      it('Should skip `skipped` tests both inside and outside the group', () => {
        const cb1 = jest.fn(() => false);
        const cb2 = jest.fn(() => false);
        const suite = vest.create(() => {
          vest.mode(vest.Modes.ALL);

          vest.skip(FieldNames.F1);
          vest.test(FieldNames.F1, cb1);

          vest.group(GroupNames.G1, () => {
            vest.test(FieldNames.F1, cb1);
            vest.test(FieldNames.F2, cb2);
          });
        });
        const res = suite();
        expect(cb1).not.toHaveBeenCalled();
        expect(cb2).toHaveBeenCalledTimes(1);
        expect(res.tests[FieldNames.F1].testCount).toBe(0);
        expect(res.tests[FieldNames.F2].testCount).toBe(1);
        expect(res.groups[GroupNames.G1][FieldNames.F1].testCount).toBe(0);
        expect(res.groups[GroupNames.G1][FieldNames.F2].testCount).toBe(1);
        expect(res.isValid()).toBe(false);
        expect(res.isValidByGroup(GroupNames.G1)).toBe(false);
        expect(res.isValidByGroup(GroupNames.G1, FieldNames.F1)).toBe(false);
        expect(res.isValidByGroup(GroupNames.G1, FieldNames.F2)).toBe(false);
        expect(res.hasErrors(FieldNames.F1)).toBe(false);
        expect(res.hasErrors(FieldNames.F2)).toBe(true);
        expect(suite.get()).toMatchSnapshot();
      });
    });

    describe('skip inside the group', () => {
      it('should skip only within the group', () => {
        const cb1 = jest.fn(() => false);
        const cb2 = jest.fn(() => false);
        const cb3 = jest.fn(() => false);
        const suite = vest.create(() => {
          vest.mode(vest.Modes.ALL);

          vest.test(FieldNames.F1, cb1);
          vest.group(GroupNames.G1, () => {
            vest.skip(FieldNames.F2);
            vest.test(FieldNames.F1, cb1);
            vest.test(FieldNames.F2, cb2);
          });
          vest.test(FieldNames.F2, cb3);
        });
        const res = suite();
        expect(cb1).toHaveBeenCalledTimes(2);
        expect(cb2).toHaveBeenCalledTimes(0);
        expect(cb3).toHaveBeenCalledTimes(1);
        expect(res.tests[FieldNames.F1].testCount).toBe(2);
        expect(res.tests[FieldNames.F2].testCount).toBe(1);
        expect(res.groups[GroupNames.G1][FieldNames.F1].testCount).toBe(1);
        expect(res.groups[GroupNames.G1][FieldNames.F2].testCount).toBe(0);
        expect(res.isValid()).toBe(false);
        expect(res.isValidByGroup(GroupNames.G1)).toBe(false);
        expect(res.isValidByGroup(GroupNames.G1, FieldNames.F1)).toBe(false);
        expect(res.isValidByGroup(GroupNames.G1, FieldNames.F2)).toBe(false);
        expect(res.hasErrors(FieldNames.F1)).toBe(true);
        expect(res.hasErrors(FieldNames.F2)).toBe(true);
        expect(suite.get()).toMatchSnapshot();
      });

      it('should skip only within the group, not the next group', () => {
        const cb1 = jest.fn(() => false);
        const cb2 = jest.fn(() => false);
        const cb3 = jest.fn(() => false);
        const suite = vest.create(() => {
          vest.mode(vest.Modes.ALL);

          vest.test(FieldNames.F1, cb1);
          vest.group(GroupNames.G1, () => {
            vest.skip(FieldNames.F2);
            vest.test(FieldNames.F1, cb1);
            vest.test(FieldNames.F2, cb2);
          });
          vest.group(GroupNames.G2, () => {
            vest.test(FieldNames.F2, cb3);
          });
        });
        const res = suite();
        expect(cb1).toHaveBeenCalledTimes(2);
        expect(cb2).toHaveBeenCalledTimes(0);
        expect(cb3).toHaveBeenCalledTimes(1);
        expect(res.tests[FieldNames.F1].testCount).toBe(2);
        expect(res.tests[FieldNames.F2].testCount).toBe(1);
        expect(res.groups[GroupNames.G1][FieldNames.F1].testCount).toBe(1);
        expect(res.groups[GroupNames.G1][FieldNames.F2].testCount).toBe(0);
        expect(res.groups[GroupNames.G2][FieldNames.F2].testCount).toBe(1);
        expect(res.isValid()).toBe(false);
        expect(res.isValidByGroup(GroupNames.G1)).toBe(false);
        expect(res.isValidByGroup(GroupNames.G1, FieldNames.F1)).toBe(false);
        expect(res.isValidByGroup(GroupNames.G1, FieldNames.F2)).toBe(false);
        expect(res.isValidByGroup(GroupNames.G2)).toBe(false);
        expect(res.isValidByGroup(GroupNames.G2, FieldNames.F2)).toBe(false);
        expect(res.hasErrors(FieldNames.F1)).toBe(true);
        expect(res.hasErrors(FieldNames.F2)).toBe(true);
        expect(suite.get()).toMatchSnapshot();
      });

      describe('skip(true)', () => {
        it('should skip only within the group', () => {
          const cb1 = jest.fn(() => false);
          const cb2 = jest.fn(() => false);
          const cb3 = jest.fn(() => false);
          const suite = vest.create(() => {
            vest.mode(vest.Modes.ALL);

            vest.group(GroupNames.G1, () => {
              vest.skip(true);
              vest.test(FieldNames.F1, cb1);
              vest.test(FieldNames.F2, cb1);
            });

            vest.group(GroupNames.G2, () => {
              vest.test(FieldNames.F2, cb3);
              vest.test(FieldNames.F3, cb3);
            });
            vest.test(FieldNames.F1, cb2);
            vest.test(FieldNames.F2, cb2);
            vest.test(FieldNames.F3, cb3);
          });
          const res = suite();
          expect(cb1).toHaveBeenCalledTimes(0);
          expect(cb2).toHaveBeenCalledTimes(2);
          expect(cb3).toHaveBeenCalledTimes(3);
          expect(res.tests[FieldNames.F1].testCount).toBe(1);
          expect(res.tests[FieldNames.F2].testCount).toBe(2);
          expect(res.tests[FieldNames.F3].testCount).toBe(2);
          expect(res.groups[GroupNames.G1][FieldNames.F1].testCount).toBe(0);
          expect(res.groups[GroupNames.G1][FieldNames.F2].testCount).toBe(0);
          expect(res.groups[GroupNames.G2][FieldNames.F2].testCount).toBe(1);
          expect(res.groups[GroupNames.G2][FieldNames.F3].testCount).toBe(1);
          expect(res.isValid()).toBe(false);
          expect(res.isValidByGroup(GroupNames.G1)).toBe(false);
          expect(res.isValidByGroup(GroupNames.G1, FieldNames.F1)).toBe(false);
          expect(res.isValidByGroup(GroupNames.G1, FieldNames.F2)).toBe(false);
          expect(res.isValidByGroup(GroupNames.G2)).toBe(false);
          expect(res.isValidByGroup(GroupNames.G2, FieldNames.F2)).toBe(false);
          expect(res.isValidByGroup(GroupNames.G2, FieldNames.F3)).toBe(false);
          expect(res.hasErrors(FieldNames.F1)).toBe(true);
          expect(res.hasErrors(FieldNames.F2)).toBe(true);
          expect(res.hasErrors(FieldNames.F3)).toBe(true);
          expect(suite.get()).toMatchSnapshot();
        });
      });
    });

    describe('only', () => {
      describe('top level only', () => {
        it('should skip all tests except `only` tests', () => {
          const cb1 = jest.fn(() => false);
          const cb2 = jest.fn(() => false);
          const cb3 = jest.fn(() => false);
          const cb4 = jest.fn(() => false);
          const suite = vest.create(() => {
            vest.mode(vest.Modes.ALL);

            vest.only(FieldNames.F1);
            vest.test(FieldNames.F1, cb1);
            vest.test(FieldNames.F2, cb4);
            vest.test(FieldNames.F3, cb4);
            vest.group(GroupNames.G1, () => {
              vest.test(FieldNames.F1, cb2);
              vest.test(FieldNames.F2, cb4);
              vest.test(FieldNames.F3, cb4);
            });

            vest.group(GroupNames.G2, () => {
              vest.test(FieldNames.F1, cb3);
              vest.test(FieldNames.F2, cb4);
              vest.test(FieldNames.F3, cb4);
            });
          });
          const res = suite();
          expect(cb1).toHaveBeenCalledTimes(1);
          expect(cb2).toHaveBeenCalledTimes(1);
          expect(cb3).toHaveBeenCalledTimes(1);
          expect(cb4).toHaveBeenCalledTimes(0);
          expect(res.tests[FieldNames.F1].testCount).toBe(3);
          expect(res.tests[FieldNames.F2].testCount).toBe(0);
          expect(res.tests[FieldNames.F3].testCount).toBe(0);
          expect(res.groups[GroupNames.G1][FieldNames.F1].testCount).toBe(1);
          expect(res.groups[GroupNames.G1][FieldNames.F2].testCount).toBe(0);
          expect(res.groups[GroupNames.G1][FieldNames.F3].testCount).toBe(0);
          expect(res.groups[GroupNames.G2][FieldNames.F1].testCount).toBe(1);
          expect(res.groups[GroupNames.G2][FieldNames.F2].testCount).toBe(0);
          expect(res.groups[GroupNames.G2][FieldNames.F3].testCount).toBe(0);
          expect(res.isValid()).toBe(false);
          expect(res.isValidByGroup(GroupNames.G1)).toBe(false);
          expect(res.isValidByGroup(GroupNames.G1, FieldNames.F1)).toBe(false);
          expect(res.isValidByGroup(GroupNames.G1, FieldNames.F2)).toBe(false);
          expect(res.isValidByGroup(GroupNames.G1, FieldNames.F3)).toBe(false);
          expect(res.isValidByGroup(GroupNames.G2)).toBe(false);
          expect(res.isValidByGroup(GroupNames.G2, FieldNames.F1)).toBe(false);
          expect(res.isValidByGroup(GroupNames.G2, FieldNames.F2)).toBe(false);

          expect(res.isValidByGroup(GroupNames.G2, FieldNames.F3)).toBe(false);
          expect(res.hasErrors(FieldNames.F1)).toBe(true);
          expect(res.hasErrors(FieldNames.F2)).toBe(false);
          expect(res.hasErrors(FieldNames.F3)).toBe(false);
          expect(suite.get()).toMatchSnapshot();
        });
      });

      describe('group only', () => {
        it('Should skip all tests except `only` tests within the group', () => {
          const cb1 = jest.fn(() => false);
          const cb2 = jest.fn(() => false);
          const cb3 = jest.fn(() => false);
          const suite = vest.create(() => {
            vest.mode(vest.Modes.ALL);

            vest.group(GroupNames.G1, () => {
              vest.only(FieldNames.F1);
              vest.test(FieldNames.F1, cb1);
              vest.test(FieldNames.F2, cb2);
              vest.test(FieldNames.F3, cb2);
            });

            vest.group(GroupNames.G2, () => {
              vest.test(FieldNames.F1, cb3);
              vest.test(FieldNames.F2, cb3);
              vest.test(FieldNames.F3, cb3);
            });
          });
          const res = suite();
          expect(cb1).toHaveBeenCalledTimes(1);
          expect(cb2).toHaveBeenCalledTimes(0);
          expect(cb3).toHaveBeenCalledTimes(3);
          expect(res.tests[FieldNames.F1].testCount).toBe(2);
          expect(res.tests[FieldNames.F2].testCount).toBe(1);
          expect(res.tests[FieldNames.F3].testCount).toBe(1);
          expect(res.groups[GroupNames.G1][FieldNames.F1].testCount).toBe(1);
          expect(res.groups[GroupNames.G1][FieldNames.F2].testCount).toBe(0);
          expect(res.groups[GroupNames.G1][FieldNames.F3].testCount).toBe(0);
          expect(res.groups[GroupNames.G2][FieldNames.F1].testCount).toBe(1);
          expect(res.groups[GroupNames.G2][FieldNames.F2].testCount).toBe(1);
          expect(res.groups[GroupNames.G2][FieldNames.F3].testCount).toBe(1);
          expect(res.isValid()).toBe(false);
          expect(res.isValidByGroup(GroupNames.G1)).toBe(false);
          expect(res.isValidByGroup(GroupNames.G1, FieldNames.F1)).toBe(false);
          expect(res.isValidByGroup(GroupNames.G1, FieldNames.F2)).toBe(false);
          expect(res.isValidByGroup(GroupNames.G1, FieldNames.F3)).toBe(false);
          expect(res.isValidByGroup(GroupNames.G2)).toBe(false);
          expect(res.isValidByGroup(GroupNames.G2, FieldNames.F1)).toBe(false);
          expect(res.isValidByGroup(GroupNames.G2, FieldNames.F2)).toBe(false);
          expect(res.isValidByGroup(GroupNames.G2, FieldNames.F3)).toBe(false);
          expect(res.hasErrors(FieldNames.F1)).toBe(true);
          expect(res.hasErrors(FieldNames.F2)).toBe(true);
          expect(res.hasErrors(FieldNames.F3)).toBe(true);
          expect(suite.get()).toMatchSnapshot();
        });
      });
    });
  });
});

describe('unnamed groups', () => {
  it('Should run tests normally', () => {
    const cb1 = jest.fn(() => false);
    const cb2 = jest.fn(() => false);
    const cb3 = jest.fn(() => false);
    const suite = vest.create(() => {
      vest.mode(vest.Modes.ALL);

      vest.group(() => {
        vest.test(FieldNames.F1, cb1);
        vest.test(FieldNames.F2, cb2);
        vest.test(FieldNames.F3, cb3);
      });
    });
    const res = suite();
    expect(cb1).toHaveBeenCalledTimes(1);
    expect(cb2).toHaveBeenCalledTimes(1);
    expect(cb3).toHaveBeenCalledTimes(1);
    expect(res.tests[FieldNames.F1].testCount).toBe(1);
    expect(res.tests[FieldNames.F2].testCount).toBe(1);
    expect(res.tests[FieldNames.F3].testCount).toBe(1);
    expect(res.isValid()).toBe(false);
    expect(res.hasErrors(FieldNames.F1)).toBe(true);
    expect(res.hasErrors(FieldNames.F2)).toBe(true);
    expect(res.hasErrors(FieldNames.F3)).toBe(true);
    expect(suite.get()).toMatchSnapshot();
  });

  it('Should complete without adding the group to the results object', () => {
    const suite = vest.create(() => {
      vest.group(() => {
        vest.test(FieldNames.F1, () => false);
        vest.test(FieldNames.F2, () => false);
        vest.test(FieldNames.F3, () => false);
      });
    });
    const res = suite();
    expect(res.groups).toEqual({});
    expect(res.isValid()).toBe(false);
    expect(suite.get()).toMatchSnapshot();
  });

  describe('with only', () => {
    it('Should only run the tests specified by only', () => {
      const cb1 = jest.fn(() => false);
      const cb2 = jest.fn(() => false);
      const cb3 = jest.fn(() => false);
      const suite = vest.create(() => {
        vest.mode(vest.Modes.ALL);

        vest.group(() => {
          vest.only(FieldNames.F1);
          vest.test(FieldNames.F1, cb1);
          vest.test(FieldNames.F2, cb2);
          vest.test(FieldNames.F3, cb3);
        });
      });
      const res = suite();
      expect(cb1).toHaveBeenCalledTimes(1);
      expect(cb2).toHaveBeenCalledTimes(0);
      expect(cb3).toHaveBeenCalledTimes(0);
      expect(res.tests[FieldNames.F1].testCount).toBe(1);
      expect(res.tests[FieldNames.F2].testCount).toBe(0);
      expect(res.tests[FieldNames.F3].testCount).toBe(0);
      expect(res.isValid()).toBe(false);
      expect(res.hasErrors(FieldNames.F1)).toBe(true);
      expect(res.hasErrors(FieldNames.F2)).toBe(false);
      expect(res.hasErrors(FieldNames.F3)).toBe(false);
      expect(suite.get()).toMatchSnapshot();
    });
  });

  describe('with skip', () => {
    it('Should skip the tests specified by skip', () => {
      const cb1 = jest.fn(() => false);
      const cb2 = jest.fn(() => false);
      const cb3 = jest.fn(() => false);
      const suite = vest.create(() => {
        vest.mode(vest.Modes.ALL);

        vest.group(() => {
          vest.skip(FieldNames.F1);
          vest.test(FieldNames.F1, cb1);
          vest.test(FieldNames.F2, cb2);
          vest.test(FieldNames.F3, cb3);
        });
      });
      const res = suite();
      expect(cb1).toHaveBeenCalledTimes(0);
      expect(cb2).toHaveBeenCalledTimes(1);
      expect(cb3).toHaveBeenCalledTimes(1);
      expect(res.tests[FieldNames.F1].testCount).toBe(0);
      expect(res.tests[FieldNames.F2].testCount).toBe(1);
      expect(res.tests[FieldNames.F3].testCount).toBe(1);
      expect(res.isValid()).toBe(false);
      expect(res.hasErrors(FieldNames.F1)).toBe(false);
      expect(res.hasErrors(FieldNames.F2)).toBe(true);
      expect(res.hasErrors(FieldNames.F3)).toBe(true);
      expect(suite.get()).toMatchSnapshot();
    });
  });

  describe('With skip(true)', () => {
    it('Should skip all tests in group', () => {
      const cb1 = jest.fn(() => false);
      const cb2 = jest.fn(() => false);
      const cb3 = jest.fn(() => false);
      const suite = vest.create(() => {
        vest.mode(vest.Modes.ALL);

        vest.group(() => {
          vest.skip(true);
          vest.test(FieldNames.F1, cb1);
          vest.test(FieldNames.F2, cb2);
          vest.test(FieldNames.F3, cb3);
        });
      });
      const res = suite();
      expect(cb1).toHaveBeenCalledTimes(0);
      expect(cb2).toHaveBeenCalledTimes(0);
      expect(cb3).toHaveBeenCalledTimes(0);
      expect(res.tests[FieldNames.F1].testCount).toBe(0);
      expect(res.tests[FieldNames.F2].testCount).toBe(0);
      expect(res.tests[FieldNames.F3].testCount).toBe(0);
      expect(res.isValid()).toBe(false);
      expect(res.hasErrors(FieldNames.F1)).toBe(false);
      expect(res.hasErrors(FieldNames.F2)).toBe(false);
      expect(res.hasErrors(FieldNames.F3)).toBe(false);
      expect(suite.get()).toMatchSnapshot();
    });
  });
});
