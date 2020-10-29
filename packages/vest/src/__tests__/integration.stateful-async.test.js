import vest from '..';
import testDummy from '../../testUtils/testDummy';

const suiteName = 'suite_name';

const suite = ({ create, ...vest }) =>
  create(suiteName, ({ skip, skipGroup }) => {
    const dummyTest = testDummy(vest);

    vest.skip(skip);
    vest.skip.group(skipGroup);

    vest.group('group', () => {
      dummyTest.failingAsync('field_1', 'field_1_group_message');
      dummyTest.failingAsync('field_4', 'field_4_group_message');
    });

    dummyTest.failing('field_1', 'field_statement_1');

    dummyTest.failingAsync('field_2', {
      time: 50,
      statement: 'rejection_message_1',
    });

    dummyTest.passing('field_2', 'field_statement_2');

    dummyTest.passingAsync('field_3', 'field_statement_3');
    dummyTest.failingAsync('field_3', 'field_statement_3');
  });

let validate, callback_1, callback_2, callback_3, callback_4, control;

describe('Stateful async tests', () => {
  beforeEach(() => {
    callback_1 = jest.fn();
    callback_2 = jest.fn();
    callback_3 = jest.fn();
    callback_4 = jest.fn();
    control = jest.fn();
    validate = suite(vest);
  });

  it('Should only run callbacks for last suite run', () =>
    new Promise(done => {
      validate(vest).done(callback_1).done('field_3', callback_2);
      expect(callback_1).not.toHaveBeenCalled();
      expect(callback_2).not.toHaveBeenCalled();
      validate(vest).done(callback_3).done('field_3', callback_4);
      expect(callback_3).not.toHaveBeenCalled();
      expect(callback_4).not.toHaveBeenCalled();
      setTimeout(() => {
        expect(callback_1).not.toHaveBeenCalled();
        expect(callback_2).not.toHaveBeenCalled();
        expect(callback_3).not.toHaveBeenCalled();
        expect(callback_4).toHaveBeenCalled();
        control();
      });
      setTimeout(() => {
        expect(callback_1).not.toHaveBeenCalled();
        expect(callback_2).not.toHaveBeenCalled();
        expect(callback_3).toHaveBeenCalled();
        expect(control).toHaveBeenCalled();
        done();
      }, 50);
    }));

  it('Merges skipped validations from previous suite', () =>
    new Promise(done => {
      const res = validate({ skipGroup: 'group', skip: 'field_3' });
      expect(res.testCount).toBe(3);
      expect(res.errorCount).toBe(1);
      expect(res.warnCount).toBe(0);
      expect(res.hasErrors('field_1')).toBe(true);
      expect(res.tests.field_1.errorCount).toBe(1);
      expect(res.hasErrors('field_2')).toBe(false);
      expect(res.hasErrors('field_3')).toBe(false);
      expect(res.hasErrors('field_4')).toBe(false);
      expect(res).toMatchSnapshot();
      setTimeout(() => {
        const res = validate.get();
        expect(res.testCount).toBe(3);
        expect(res.errorCount).toBe(2);
        expect(res.warnCount).toBe(0);
        expect(res.tests.field_1.errorCount).toBe(1);
        expect(res.hasErrors('field_2')).toBe(true);
        expect(res.hasErrors('field_3')).toBe(false);
        expect(res.hasErrors('field_4')).toBe(false);
        expect(res).toMatchSnapshot();

        validate({ skip: 'field_2' }).done(res => {
          expect(res.testCount).toBe(7);
          expect(res.errorCount).toBe(5);
          expect(res.warnCount).toBe(0);
          expect(res.tests.field_1.errorCount).toBe(2);
          expect(res.hasErrors('field_2')).toBe(true);
          expect(res.hasErrors('field_3')).toBe(true);
          expect(res.hasErrors('field_4')).toBe(true);
          expect(res).toMatchSnapshot();
          done();
        });
      }, 50);
    }));
});
