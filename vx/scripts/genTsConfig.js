const fs = require('fs');

const lodash = require('lodash');

const getModuleAliases = require('../util/moduleAliases');

const exec = require('vx/exec');
const logger = require('vx/logger');
const vxPath = require('vx/vxPath');

const prevTsConfig = require(vxPath.TSCONFIG_PATH);

const moduleAliases = getModuleAliases();

const paths = moduleAliases.reduce(
  (paths, currentModule) =>
    Object.assign(paths, { [currentModule.name]: [currentModule.relative] }),
  {}
);

const tsConfig = tsConfigTemplate();

tsConfig.compilerOptions.paths = paths;

if (!lodash.isEqual(prevTsConfig, tsConfig)) {
  logger.log('generating ts config');

  fs.writeFileSync(vxPath.TSCONFIG_PATH, JSON.stringify(tsConfig, null, 2));

  exec(`yarn prettier ${vxPath.TSCONFIG_PATH} -w`);
}

function tsConfigTemplate() {
  return {
    compilerOptions: {
      allowJs: false,
      baseUrl: '.',
      // output .d.ts declaration files for consumers
      declaration: true,
      // interop between ESM and CJS modules. Recommended by TS
      esModuleInterop: true,
      // error out if import and file system have a casing mismatch. Recommended by TS
      forceConsistentCasingInFileNames: true,
      importHelpers: true,
      lib: ['esnext'],
      module: 'esnext',
      // use Node's module resolution algorithm, instead of the legacy TS one
      moduleResolution: 'node',
      // `tsdx build` ignores this option, but it is commonly used when type-checking separately with `tsc`
      noEmit: true,
      noFallthroughCasesInSwitch: true,
      noImplicitAny: true,
      // linter checks for common issues
      noImplicitReturns: false,
      noImplicitThis: true,
      // noUnused* overlap with @typescript-eslint/no-unused-vars, can disable if duplicative
      noUnusedLocals: true,
      noUnusedParameters: true,
      rootDir: '.',
      // significant perf increase by skipping checking .d.ts files, particularly those in node_modules. Recommended by TS
      skipLibCheck: true,
      // output .js.map sourcemap files for consumers
      sourceMap: true,
      // match output dir to input dir. e.g. dist/index instead of dist/src/index
      // stricter type-checking for stronger correctness. Recommended by TS
      strict: true,
    },
    files: ['./config/jest/globals.d.ts'],
    include: ['./packages/*/src/**/*.ts'],
  };
}
