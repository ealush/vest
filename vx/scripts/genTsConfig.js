const fs = require('fs');

const lodash = require('lodash');

const exec = require('vx/exec');
const logger = require('vx/logger');
const getModuleAliases = require('vx/util/moduleAliases');
const vxPath = require('vx/vxPath');

const prevTsConfig = require(vxPath.TSCONFIG_PATH);

const moduleAliases = getModuleAliases();

const paths = moduleAliases.reduce(
  (paths, currentModule) =>
    Object.assign(paths, { [currentModule.name]: [currentModule.relative] }),
  {}
);

module.exports = function genTsConfig() {
  const tsConfig = tsConfigTemplate();

  tsConfig.compilerOptions.paths = paths;

  if (!lodash.isEqual(prevTsConfig, tsConfig)) {
    logger.log('generating ts config');

    fs.writeFileSync(vxPath.TSCONFIG_PATH, JSON.stringify(tsConfig, null, 2));

    exec(`yarn prettier ${vxPath.TSCONFIG_PATH} -w`);
  }
};

function tsConfigTemplate() {
  return {
    compilerOptions: {
      allowJs: false,
      baseUrl: '.',
      declaration: true,
      esModuleInterop: true,
      forceConsistentCasingInFileNames: true,
      importHelpers: true,
      lib: ['esnext'],
      module: 'esnext',
      moduleResolution: 'node',
      noEmit: true,
      noFallthroughCasesInSwitch: true,
      noImplicitAny: true,
      noImplicitReturns: false,
      noImplicitThis: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      rootDir: '.',
      skipLibCheck: true,
      sourceMap: true,
      strict: true,
    },
    files: [`${vxPath.rel(vxPath.JEST_CONFIG_PATH)}/globals.d.ts`],
    include: [vxPath.rel(vxPath.packageSrc('*', '**/*.ts'))],
  };
}
