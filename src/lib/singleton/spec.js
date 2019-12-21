import _ from 'lodash';
import faker from 'faker';
import { version } from '../../../package.json';
import vest from '../..';
import go from '../globalObject';
import { SYMBOL_VEST } from './constants';
import singleton from '.';

describe('singleton', () => {

    afterAll(() => {
        singleton.register(vest);
    });

    describe('Attaching to global scope', () => {
        beforeEach(() => {
            delete go[SYMBOL_VEST];
        });

        afterEach(() => {
            delete go[SYMBOL_VEST];
        });

        test('That global instance is not populated', () => {
            expect(go[SYMBOL_VEST]).toBe(undefined);
        });

        it('Should register vest on the global object', () => {
            singleton.register(vest);

            expect(go[SYMBOL_VEST]).toBe(vest);
        });

        describe('When already registered', () => {

            beforeEach(() => {
                singleton.register(vest);
            });

            describe('When same version', () => {
                it('Should return silently', (done) => {
                    const timeout = setTimeout(() => done(), 300);

                    process.on('uncaughtException', () => {
                        clearTimeout(timeout);
                    });
                });
            });

            describe('When different version', () => {
                let singleton, mockThrowError;

                beforeEach(() => {
                    mockThrowError = jest.fn();
                    jest.resetModules();
                    jest.mock('../throwError/', () => ({
                        __esModule: true,
                        default: mockThrowError
                    }));
                    singleton = require('.');
                });

                afterEach(() => {
                    jest.resetAllMocks();
                });

                it('Should throw an error', () => {
                    const fn = () => null;
                    fn.VERSION = '222';

                    singleton.register(fn);
                    expect(mockThrowError.mock.calls[0][0]).toBe(`Multiple versions of Vest detected: (222,${version}).\n    Most features should work regularly, but for optimal feature compatibility, you should have all running instances use the same version.`);
                });
            });
        });
    });

    describe('Make sure everything works together', () => {

        beforeAll(() => {
            singleton.register(vest);
        });

        const instances = []
            .concat(
                require('../../'),
                global.vestDistVersions
            );

        const pairs = instances.reduce((pairs, { validate }) => (
            [...pairs, ...instances.map(({ test }) => [ validate, test ])]
        ), []);

        it.each(pairs)(
            'Should produce correct validation result',
            (validate, test) => {
                const errorCount = _.random(1, 10);
                const successCount = _.random(1, 10);
                const warnCount = _.random(1, 10);
                const output = validate(faker.random.word(), () => {
                    Array.from({ length: warnCount }, () => test(faker.random.word(), faker.lorem.sentence(), function() {
                        this.warn();
                        return false;
                    }));
                    Array.from({ length: errorCount }, () => test(faker.random.word(), faker.lorem.sentence(), () => false));
                    Array.from({ length: successCount }, () => test(faker.random.word(), faker.lorem.sentence(), () => true));
                });

                expect(output.errorCount).toBe(errorCount);
                expect(output.warnCount).toBe(warnCount);
                expect(output.testCount).toBe(warnCount + errorCount + successCount);
            }
        );
    });
});
