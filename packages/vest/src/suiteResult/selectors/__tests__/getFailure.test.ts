import * as vest from 'vest';

describe('->getFailure (singular form)', () => {
  describe('getError', () => {
    describe('When not passing a field name', () => {
      describe('When there are no errors', () => {
        it('Should return undefined', () => {
          const suite = vest.create(() => {});
          expect(suite().getErrors()).toEqual({});
          expect(suite.get().getError()).toBeUndefined();
        });
      });

      describe('When there are errors', () => {
        it('Should return the first error object', () => {
          const suite = vest.create(() => {
            vest.test('field_1', 'msg_1', () => false);
            vest.test('field_2', 'msg_2', () => false);
          });
          expect(suite().getError()).toEqual({
            fieldName: 'field_1',
            message: 'msg_1',
            groupName: undefined,
          });
        });
      });
    });

    describe('When no tests', () => {
      describe('When requesting a fieldName', () => {
        it('Should return undefined', () => {
          const suite = vest.create(() => {});
          expect(suite().getErrors()).toEqual({});
          expect(suite.get().getError('field_2')).toBeUndefined();
        });
      });
    });

    describe('When no errors', () => {
      it('Should return undefined', () => {
        const suite = vest.create(() => {
          vest.test('field_1', 'msg_1', () => {});
        });
        expect(suite().getError('field_1')).toBeUndefined();
        expect(suite.get().getError('field_1')).toBeUndefined();
      });
    });

    describe('When there are errors', () => {
      it('Should return the first error', () => {
        const suite = vest.create(() => {
          vest.test('field_1', 'msg_1', () => false);
          vest.test('field_2', 'msg_2', () => false);
        });
        expect(suite().getError('field_1')).toBe('msg_1');
      });
    });

    describe('When there are errors', () => {
      describe('When there is only one error', () => {
        it('Should return the error', () => {
          const suite = vest.create(() => {
            vest.test('field_1', 'msg_1', () => false);
          });
          expect(suite().getError('field_1')).toBe('msg_1');
          expect(suite.get().getError('field_1')).toBe('msg_1');
        });
      });

      describe('When there are multiple errors', () => {
        it('Should return the first error', () => {
          const suite = vest.create(() => {
            vest.test('field_1', 'msg_1', () => false);
            vest.test('field_1', 'msg_2', () => false);
          });
          expect(suite().getError('field_1')).toBe('msg_1');
          expect(suite.get().getError('field_1')).toBe('msg_1');
        });
      });

      describe('When checking the incorrect field', () => {
        it('Should return undefined', () => {
          const suite = vest.create(() => {
            vest.test('field_1', 'msg_1', () => false);
          });
          expect(suite().getError('field_2')).toBeUndefined();
          expect(suite.get().getError('field_2')).toBeUndefined();
        });
      });
    });
  });

  describe('getWarning', () => {
    describe('When not passing a field name', () => {
      describe('When there are no warnings', () => {
        it('Should return undefined', () => {
          const suite = vest.create(() => {});
          expect(suite().getWarnings()).toEqual({});
          expect(suite.get().getWarning()).toBeUndefined();
        });
      });

      describe('When there are warnings', () => {
        it('Should return the first warning object', () => {
          const suite = vest.create(() => {
            vest.test('t1', 't1 message', () => {
              vest.warn();
              return false;
            });

            vest.test('t2', 't2 message', () => {
              vest.warn();
              return false;
            });
          });

          expect(suite().getWarning()).toEqual({
            fieldName: 't1',
            message: 't1 message',
            groupName: undefined,
          });
        });
      });
    });

    describe('When no tests', () => {
      describe('When requesting a fieldName', () => {
        it('Should return undefined', () => {
          const suite = vest.create(() => {});
          expect(suite().getWarnings()).toEqual({});
          expect(suite.get().getWarning('field_2')).toBeUndefined();
        });
      });
    });

    describe('When no warnings', () => {
      it('Should return undefined', () => {
        const suite = vest.create(() => {
          vest.test('field_1', 'msg_1', () => {});
        });
        expect(suite().getWarning('field_1')).toBeUndefined();
        expect(suite.get().getWarning('field_1')).toBeUndefined();
      });
    });

    describe('When there are warnings', () => {
      describe('When there is only one warning', () => {
        it('Should return the warning', () => {
          const suite = vest.create(() => {
            vest.test('field_1', 'msg_1', () => {
              vest.warn();
              return false;
            });
          });
          expect(suite().getWarning('field_1')).toBe('msg_1');
          expect(suite.get().getWarning('field_1')).toBe('msg_1');
        });
      });

      describe('When there are multiple warnings', () => {
        it('Should return the first warning', () => {
          const suite = vest.create(() => {
            vest.test('field_1', 'msg_1', () => {
              vest.warn();
              return false;
            });
            vest.test('field_1', 'msg_2', () => {
              vest.warn();
              return false;
            });
          });
          expect(suite().getWarning('field_1')).toBe('msg_1');
          expect(suite.get().getWarning('field_1')).toBe('msg_1');
        });
      });

      describe('When checking the incorrect field', () => {
        it('Should return undefined', () => {
          const suite = vest.create(() => {
            vest.test('field_1', 'msg_1', () => {
              vest.warn();
              return false;
            });
          });
          expect(suite().getWarning('field_2')).toBeUndefined();
          expect(suite.get().getWarning('field_2')).toBeUndefined();
        });
      });
    });
  });

  describe('getMessage', () => {
    describe('When the field has an error', () => {
      it('Should return the error message', () => {
        const suite = vest.create(() => {
          vest.test('field_1', 'msg_1', () => false);
        });
        expect(suite().getMessage('field_1')).toBe('msg_1');
        expect(suite.get().getMessage('field_1')).toBe('msg_1');
      });
    });

    describe('When the field has a warning', () => {
      it('Should return the warning message', () => {
        const suite = vest.create(() => {
          vest.test('field_1', 'msg_1', () => {
            vest.warn();
            return false;
          });
        });
        expect(suite().getMessage('field_1')).toBe('msg_1');
        expect(suite.get().getMessage('field_1')).toBe('msg_1');
      });
    });

    describe('When the field has no errors or warnings', () => {
      it('Should return undefined', () => {
        const suite = vest.create(() => {
          vest.test('field_1', 'msg_1', () => {});
        });
        expect(suite().getMessage('field_1')).toBeUndefined();
        expect(suite.get().getMessage('field_1')).toBeUndefined();
      });
    });

    describe('When the field has both an error and a warning', () => {
      it('Should return the error message', () => {
        const suite = vest.create(() => {
          vest.test('field_1', 'msg_1', () => false);
          vest.test('field_1', 'msg_2', () => {
            vest.warn();
            return false;
          });
        });
        expect(suite().getMessage('field_1')).toBe('msg_1');
        expect(suite.get().getMessage('field_1')).toBe('msg_1');
      });
    });

    describe('When the field has multiple errors', () => {
      it('Should return the first error message', () => {
        const suite = vest.create(() => {
          vest.test('field_1', 'msg_1', () => false);
          vest.test('field_1', 'msg_2', () => false);
        });
        expect(suite().getMessage('field_1')).toBe('msg_1');
        expect(suite.get().getMessage('field_1')).toBe('msg_1');
      });
    });

    describe('When the field has multiple warnings', () => {
      it('Should return the first warning message', () => {
        const suite = vest.create(() => {
          vest.test('field_1', 'msg_1', () => {
            vest.warn();
            return false;
          });
          vest.test('field_1', 'msg_2', () => {
            vest.warn();
            return false;
          });
        });
        expect(suite().getMessage('field_1')).toBe('msg_1');
        expect(suite.get().getMessage('field_1')).toBe('msg_1');
      });
    });

    describe('When the field does not exist', () => {
      it('Should return undefined', () => {
        const suite = vest.create(() => {});
        expect(suite().getMessage('field_1')).toBeUndefined();
        expect(suite.get().getMessage('field_1')).toBeUndefined();
      });
    });
  });
});
