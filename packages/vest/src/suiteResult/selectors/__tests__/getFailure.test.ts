import { describe, it, expect } from 'vitest';

import * as vest from '../../../vest';

describe('->getFailure (singular form)', () => {
  describe('getError', () => {
    describe('when not passing a field name', () => {
      describe('when there are no errors', () => {
        it('should return undefined', () => {
          const suite = vest.create(() => {});
          expect(suite.run().getErrors()).toEqual({});
          expect(suite.get().getError()).toBeUndefined();
        });
      });

      describe('when there are errors', () => {
        it('should return the first error object', () => {
          const suite = vest.create(() => {
            vest.test('field_1', 'msg_1', () => false);
            vest.test('field_2', 'msg_2', () => false);
          });
          expect(suite.run().getError()).toEqual({
            fieldName: 'field_1',
            message: 'msg_1',
            groupName: undefined,
          });
        });
      });
    });

    describe('when no tests', () => {
      describe('when requesting a fieldName', () => {
        it('should return undefined', () => {
          const suite = vest.create(() => {});
          expect(suite.run().getErrors()).toEqual({});
          expect(suite.get().getError('field_2')).toBeUndefined();
        });
      });
    });

    describe('when no errors', () => {
      it('should return undefined', () => {
        const suite = vest.create(() => {
          vest.test('field_1', 'msg_1', () => {});
        });
        expect(suite.run().getError('field_1')).toBeUndefined();
        expect(suite.get().getError('field_1')).toBeUndefined();
      });
    });

    describe('when there are errors', () => {
      it('should return the first error', () => {
        const suite = vest.create(() => {
          vest.test('field_1', 'msg_1', () => false);
          vest.test('field_2', 'msg_2', () => false);
        });
        expect(suite.run().getError('field_1')).toBe('msg_1');
      });
    });

    describe('when there are errors', () => {
      describe('when there is only one error', () => {
        it('should return the error', () => {
          const suite = vest.create(() => {
            vest.test('field_1', 'msg_1', () => false);
          });
          expect(suite.run().getError('field_1')).toBe('msg_1');
          expect(suite.get().getError('field_1')).toBe('msg_1');
        });
      });

      describe('when there are multiple errors', () => {
        it('should return the first error', () => {
          const suite = vest.create(() => {
            vest.test('field_1', 'msg_1', () => false);
            vest.test('field_1', 'msg_2', () => false);
          });
          expect(suite.run().getError('field_1')).toBe('msg_1');
          expect(suite.get().getError('field_1')).toBe('msg_1');
        });
      });

      describe('when checking an incorrect field', () => {
        it('should return undefined', () => {
          const suite = vest.create(() => {
            vest.test('field_1', 'msg_1', () => false);
          });
          expect(suite.run().getError('field_2')).toBeUndefined();
          expect(suite.get().getError('field_2')).toBeUndefined();
        });
      });
    });
  });

  describe('getWarning', () => {
    describe('when not passing a field name', () => {
      describe('when there are no warnings', () => {
        it('should return undefined', () => {
          const suite = vest.create(() => {});
          expect(suite.run().getWarnings()).toEqual({});
          expect(suite.get().getWarning()).toBeUndefined();
        });
      });

      describe('when there are warnings', () => {
        it('should return the first warning object', () => {
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

          expect(suite.run().getWarning()).toEqual({
            fieldName: 't1',
            message: 't1 message',
            groupName: undefined,
          });
        });
      });
    });

    describe('when no tests', () => {
      describe('when requesting a fieldName', () => {
        it('should return undefined', () => {
          const suite = vest.create(() => {});
          expect(suite.run().getWarnings()).toEqual({});
          expect(suite.get().getWarning('field_2')).toBeUndefined();
        });
      });
    });

    describe('when there are no warnings', () => {
      it('should return undefined', () => {
        const suite = vest.create(() => {
          vest.test('field_1', 'msg_1', () => {});
        });
        expect(suite.run().getWarning('field_1')).toBeUndefined();
        expect(suite.get().getWarning('field_1')).toBeUndefined();
      });
    });

    describe('when there are warnings', () => {
      describe('when there is only one warning', () => {
        it('should return the warning', () => {
          const suite = vest.create(() => {
            vest.test('field_1', 'msg_1', () => {
              vest.warn();
              return false;
            });
          });
          expect(suite.run().getWarning('field_1')).toBe('msg_1');
          expect(suite.get().getWarning('field_1')).toBe('msg_1');
        });
      });

      describe('when there are multiple warnings', () => {
        it('should return the first warning', () => {
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
          expect(suite.run().getWarning('field_1')).toBe('msg_1');
          expect(suite.get().getWarning('field_1')).toBe('msg_1');
        });
      });

      describe('when checking an incorrect field', () => {
        it('should return undefined', () => {
          const suite = vest.create(() => {
            vest.test('field_1', 'msg_1', () => {
              vest.warn();
              return false;
            });
          });
          expect(suite.run().getWarning('field_2')).toBeUndefined();
          expect(suite.get().getWarning('field_2')).toBeUndefined();
        });
      });
    });
  });

  describe('getMessage', () => {
    describe('when the field has an error', () => {
      it('should return the error message', () => {
        const suite = vest.create(() => {
          vest.test('field_1', 'msg_1', () => false);
        });
        expect(suite.run().getMessage('field_1')).toBe('msg_1');
        expect(suite.get().getMessage('field_1')).toBe('msg_1');
      });
    });

    describe('when the field has a warning', () => {
      it('should return the warning message', () => {
        const suite = vest.create(() => {
          vest.test('field_1', 'msg_1', () => {
            vest.warn();
            return false;
          });
        });
        expect(suite.run().getMessage('field_1')).toBe('msg_1');
        expect(suite.get().getMessage('field_1')).toBe('msg_1');
      });
    });

    describe('when the field has no errors or warnings', () => {
      it('should return undefined', () => {
        const suite = vest.create(() => {
          vest.test('field_1', 'msg_1', () => {});
        });
        expect(suite.run().getMessage('field_1')).toBeUndefined();
        expect(suite.get().getMessage('field_1')).toBeUndefined();
      });
    });

    describe('when the field has both an error and a warning', () => {
      it('should return the error message', () => {
        const suite = vest.create(() => {
          vest.test('field_1', 'msg_1', () => false);
          vest.test('field_1', 'msg_2', () => {
            vest.warn();
            return false;
          });
        });
        expect(suite.run().getMessage('field_1')).toBe('msg_1');
        expect(suite.get().getMessage('field_1')).toBe('msg_1');
      });
    });

    describe('when the field has multiple errors', () => {
      it('should return the first error message', () => {
        const suite = vest.create(() => {
          vest.test('field_1', 'msg_1', () => false);
          vest.test('field_1', 'msg_2', () => false);
        });
        expect(suite.run().getMessage('field_1')).toBe('msg_1');
        expect(suite.get().getMessage('field_1')).toBe('msg_1');
      });
    });

    describe('when the field has multiple warnings', () => {
      it('should return the first warning message', () => {
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
        expect(suite.run().getMessage('field_1')).toBe('msg_1');
        expect(suite.get().getMessage('field_1')).toBe('msg_1');
      });
    });

    describe('when the field does not exist', () => {
      it('should return undefined', () => {
        const suite = vest.create(() => {});
        expect(suite.run().getMessage('field_1')).toBeUndefined();
        expect(suite.get().getMessage('field_1')).toBeUndefined();
      });
    });
  });
});
