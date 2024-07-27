import { enforce } from 'n4s';
import 'date';

describe('date', () => {
  describe('isDate', () => {
    /** enforce(value).isDate()
     * check if the string is a valid date. e.g. [2002-07-15, new Date()].
     * options is an object which can contain the keys format, strictMode and/or delimiters.
     * format is a string and defaults to YYYY/MM/DD.
     * strictMode is a boolean and defaults to false. If strictMode is set to true, the validator will reject strings different from format.
     * delimiters is an array of allowed date delimiters and defaults to ['/', '-'].
     */

    it('Should pass for valid dates', () => {
      expect(() => enforce('2002-07-15').isDate()).not.toThrow();
      expect(() => enforce(new Date()).isDate()).not.toThrow();
      expect(() => enforce('2002/07/15').isDate()).not.toThrow();
    });

    it('Should fail for invalid dates', () => {
      expect(() => enforce(0).isDate()).toThrow();
      expect(() => enforce('2002-07-15T00:00:00.000Z').isDate()).toThrow();
      expect(() => enforce(Date.now()).isDate()).toThrow();
    });

    describe('With options', () => {
      describe('format', () => {
        // Valid formats:
        /**
         * YYYY/MM/DD
            YY/MM/DD
            YYYY-MM-DD
            YY-MM-DD
            MM/DD/YYYY
            MM/DD/YY
            MM-DD-YYYY
            MM-DD-YY
            DD/MM/YYYY
            DD/MM/YY
            DD-MM-YYYY
            DD-MM-YY
         */
        it('Should pass for valid dates', () => {
          expect(() =>
            enforce('2002-07-15').isDate({ format: 'YYYY-MM-DD' }),
          ).not.toThrow();
          expect(() =>
            enforce('2002/07/15').isDate({ format: 'YYYY/MM/DD' }),
          ).not.toThrow();
          expect(() =>
            enforce('07/15/2002').isDate({ format: 'MM/DD/YYYY' }),
          ).not.toThrow();
          expect(() =>
            enforce('07-15-2002').isDate({ format: 'MM-DD-YYYY' }),
          ).not.toThrow();
          expect(() =>
            enforce('15/07/2002').isDate({ format: 'DD/MM/YYYY' }),
          ).not.toThrow();
          expect(() =>
            enforce('15-07-2002').isDate({ format: 'DD-MM-YYYY' }),
          ).not.toThrow();
          expect(() =>
            enforce('02-07-15').isDate({ format: 'YY-MM-DD' }),
          ).not.toThrow();
          expect(() =>
            enforce('02/07/15').isDate({ format: 'YY/MM/DD' }),
          ).not.toThrow();
          expect(() =>
            enforce('07/15/02').isDate({ format: 'MM/DD/YY' }),
          ).not.toThrow();
          expect(() =>
            enforce('07-15-02').isDate({ format: 'MM-DD-YY' }),
          ).not.toThrow();
        });

        it('Should fail for invalid dates', () => {
          expect(() =>
            enforce('2002-07-15').isDate({
              format: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
            }),
          ).toThrow();
        });
      });
      describe('strictMode', () => {
        it('Should pass for valid dates', () => {
          expect(() =>
            enforce('2002-07-15').isDate({
              strictMode: true,
              format: 'YYYY-MM-DD',
            }),
          ).not.toThrow();
        });

        it('Should fail for invalid dates', () => {
          expect(() =>
            enforce('2002-07-15').isDate({
              strictMode: true,
              format: 'YYYY/MM/DD',
            }),
          ).toThrow();
        });
      });
    });
  });

  describe('isAfter', () => {
    /**
     * check if the string is a date that is after the specified date.
        options is an object that defaults to Date().toString() }.       Options:
        comparisonDate: Date to compare to. Defaults to Date().toString() (now).
     */

    it('Should pass for dates after the comparison date', () => {
      expect(() => enforce('2002-07-15').isAfter('2002-07-14')).not.toThrow();
      expect(() => enforce('2002-07-15').isAfter('2002-07-12')).not.toThrow();
    });

    it('Should pass for dates later than now', () => {
      expect(() => enforce('2100-07-15').isAfter()).not.toThrow();
    });

    it('Should fail for dates before the comparison date', () => {
      expect(() => enforce('2002-07-15').isAfter('2002-07-16')).toThrow();
      expect(() => enforce('2002-07-15').isAfter('2002-07-17')).toThrow();
    });

    it('Should fail for dates earlier than now', () => {
      expect(() => enforce('1900-07-15').isAfter()).toThrow();
    });
  });

  describe('isBefore', () => {
    it('Should pass for dates before the comparison date', () => {
      expect(() => enforce('2002-07-15').isBefore('2002-07-16')).not.toThrow();
      expect(() => enforce('2002-07-15').isBefore('2002-07-17')).not.toThrow();
    });

    it('Should pass for dates earlier than now', () => {
      expect(() => enforce('1900-07-15').isBefore()).not.toThrow();
    });

    it('Should fail for dates after the comparison date', () => {
      expect(() => enforce('2002-07-15').isBefore('2002-07-14')).toThrow();
      expect(() => enforce('2002-07-15').isBefore('2002-07-12')).toThrow();
    });

    it('Should fail for dates later than now', () => {
      expect(() => enforce('2100-07-15').isBefore()).toThrow();
    });
  });

  describe('isISO8601', () => {
    /**
     check if the string is a valid ISO 8601 date.
      options is an object which defaults to { strict: false, strictSeparator: false }. If strict is true, date strings with invalid dates like 2009-02-29 will be invalid. If strictSeparator is true, date strings with date and time separated by anything other than a T will be invalid.
     */

    it('Should pass for valid ISO8601 dates', () => {
      expect(() =>
        enforce('2020-07-10 15:00:00.000').isISO8601(),
      ).not.toThrow();

      expect(() => enforce('2020-07-10').isISO8601()).not.toThrow();

      expect(() =>
        enforce('2020-07-10T15:00:00.000').isISO8601(),
      ).not.toThrow();

      expect(() => enforce('2020-07-10T15:00:00Z').isISO8601()).not.toThrow();

      expect(() =>
        enforce('2020-07-10T15:00:00+05:00').isISO8601(),
      ).not.toThrow();
    });

    it('Should fail for invalid ISO8601 dates', () => {
      expect(() => enforce(0).isISO8601()).toThrow();
      expect(() => enforce(new Date()).isISO8601()).toThrow();
      expect(() => enforce('2020/07/10T15:00:00.000Z').isISO8601()).toThrow();
    });

    describe('strict', () => {
      it('Should pass for valid ISO8601 dates', () => {
        expect(() =>
          enforce('2020-07-10 15:00:00.000').isISO8601({ strict: true }),
        ).not.toThrow();

        expect(() =>
          enforce('2020-07-10').isISO8601({ strict: true }),
        ).not.toThrow();

        expect(() =>
          enforce('2020-07-10T15:00:00.000').isISO8601({ strict: true }),
        ).not.toThrow();

        expect(() =>
          enforce('2020-07-10T15:00:00Z').isISO8601({ strict: true }),
        ).not.toThrow();

        expect(() =>
          enforce('2020-07-10T15:00:00+05:00').isISO8601({ strict: true }),
        ).not.toThrow();
      });

      it('Should fail for invalid ISO8601 dates', () => {
        expect(() => enforce(0).isISO8601({ strict: true })).toThrow();
        expect(() => enforce(new Date()).isISO8601({ strict: true })).toThrow();
        expect(() =>
          enforce('2020/07/10T15:00:00.000Z').isISO8601({ strict: true }),
        ).toThrow();
      });
    });

    describe('strictSeparator', () => {
      it('Should pass for valid ISO8601 dates', () => {
        expect(() =>
          enforce('2002-07-15T00:00:00.000Z').isISO8601({
            strictSeparator: true,
          }),
        ).not.toThrow();

        expect(() =>
          enforce('2020-07-10').isISO8601({ strictSeparator: true }),
        ).not.toThrow();

        expect(() =>
          enforce('2020-07-10T15:00:00.000').isISO8601({
            strictSeparator: true,
          }),
        ).not.toThrow();

        expect(() =>
          enforce('2020-07-10T15:00:00Z').isISO8601({
            strictSeparator: true,
          }),
        ).not.toThrow();

        expect(() =>
          enforce('2020-07-10T15:00:00+05:00').isISO8601({
            strictSeparator: true,
          }),
        ).not.toThrow();
      });

      it('Should fail for invalid ISO8601 dates', () => {
        expect(() =>
          enforce('2020/07/10T15:00:00.000Z').isISO8601({
            strictSeparator: true,
          }),
        ).toThrow();
      });
    });
  });
});
