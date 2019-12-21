import faker from 'faker';
import { noop } from 'lodash';
import validate from '.';

describe('Test validate suite wrapper', () => {

    describe('Test arguments', () => {
        let mockThrowError, validate;

        beforeEach(() => {
            mockThrowError = jest.fn();
            jest.resetModules();
            jest.mock('../../lib/throwError/', () => ({
                __esModule: true,
                default: mockThrowError
            }));
            validate = require('.');
        });

        afterEach(() => {
            jest.resetAllMocks();
        });

        it.each([[1, {}, noop]])(
            'Should throw a typerror error for a non string name.',
            (value) => {
                validate(value, noop);
                expect(mockThrowError).toHaveBeenCalledWith(
                    'Suite initialization error. Expected name to be a string.',
                    TypeError
                );
            }
        );

        it.each([[1, {}, 'noop']])(
            'Should throw a typerror error for a non function tests callback.',
            (value) => {
                validate(faker.random.word(), value);
                expect(mockThrowError).toHaveBeenCalledWith(
                    'Suite initialization error. Expected tests to be a function.',
                    TypeError
                );
            }
        );
    });

    it('Calls `tests` argument', (done) => {
        validate('FormName', done);
    });

    describe('Context creation', () => {
        let mockContext, validate, name;

        beforeEach(() => {
            name = 'formName';
            mockContext = jest.fn();
            mockContext.clear = jest.fn();
            jest.resetModules();
            jest.mock('../Context/', () => ({
                __esModule: true,
                default: mockContext
            }));
            validate = require('.');
            validate(name, noop);
        });

        afterEach(() => {
            jest.resetAllMocks();
        });

        it('Should create a new context object with initialized suite data', () => {
            expect(mockContext.mock.calls[0][0]).toMatchSnapshot();
        });

        it('Should clear created context', () => {
            expect(mockContext.clear).toHaveBeenCalled();
        });
    });
});
