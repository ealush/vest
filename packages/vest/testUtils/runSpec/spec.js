import runSpec from '.';

describe('module: runSpec', () => {
  let isWatchMode, vestSrc;

  beforeEach(() => {
    isWatchMode = global.isWatchMode;
    vestSrc = require('../../src');
  });

  afterEach(() => {
    global.isWatchMode = isWatchMode;
  });

  describe('jest --watch', () => {
    beforeEach(() => {
      global.isWatchMode = true;
    });

    it('Should run only against source', () => {
      let counter = 0;
      runSpec(vest => {
        counter++;
        expect(vest).toBe(vestSrc);
      });

      expect(counter).toBe(1);
    });
  });

  describe('jest', () => {
    let vestDistVersions;
    beforeEach(() => {
      vestDistVersions = [];
      global.isWatchMode = false;
    });

    it('Should run against source and dist', () => {
      let counter = 0;
      runSpec(vest => {
        counter++;
        vestDistVersions.push(vest);
      });

      expect(vestDistVersions).toContain(vestSrc);
      expect(vestDistVersions).toContain(require('../../dist/vest.js'));
      expect(vestDistVersions).toContain(require('../../dist/vest.min.js'));
      expect(vestDistVersions).toContain(
        require('../../dist/vest.development.js')
      );

      expect(counter).toBe(4);
    });
  });
});
