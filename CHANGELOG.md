# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## vest: [2.1.0] - 2020-08-09

### Added
- d1ce227 minor: add vest.skip.group and vest.only.group (#225) (ealush)
- 19e592e added: test.memo for memoized tests (#238) (ealush)
- e6cccc9 added: returned function name is the name of the suite (ealush)
- f9f1d39 added: promisify utility (#261) (adife)

### Fixed and improved
- ba6ca3d fix: make vest.reset restore initial state (#235) (ealush)
- a657058 patch: cache validation result for improved runtime performance (#237) (ealush)
- 96210af Skip cache when resolving done results (#240) (ealush)
- c2beec9 fix: edge case when calling done after delay (#252) (ealush)
- 2582c43 types: group and skip types (#258) (ealush)
- a215c43 patch: return enforce from extend api (ealush)
- bb6cc1d fix: added safeguard to async test inference (#266) (ealush)
- ff5608f Update README.md (ealush)
- 553c8fe patch: Move exclusion to context (#274) (ealush)
- 4f24697 patch: Replace global object with closures (#275) (ealush)
- a3bc606 patch: clean runAsyncTest done callback (ealush)
- 4d3b583 Update README.md (ealush)
- 32ea43f Use latest branch (ealush)
- 51e7aa2 patch: Skip iteration of pending tests (#294) (ealush)

## n4s: [2.1.0] - 2020-08-09

### Added
- 062c40a added:  add isNaN rule (#300) (ealush)

## vest: [2.0.0] - 2020-06-20

### Changed or removed

- 7872203 major: stateful validations (#148) (ealush)
- 0b41ac6 breaking: throwError actually throws (#149) (ealush)

### Added

- f7ae45b minor: vest.reset() (#150) (ealush)
- c4e827c feat: Separate vest.create from its result function by making validate accept arguments (#151) (ealush)
- cf19610 feat: add valid class to classNames utility (ealush)
- d65ac73 added: test grouping support (#174) (ealush)
- 492e651 added: utility - classNames (#200) (ealush)
- c7a384f added: hook vest.get (#202) (ealush)

### Fixed and improved

- b9ebf1e patch: remove canceled tests from canceled state (#152) (ealush)
- d22f529 patch: validateSuiteParams module (ealush)
- 07bcb51 patch: nested context support (#157) (ealush)
- ed58c37 test: add dummy test helper (#163) (ealush)
- 2dd93ae patch: add error handling to runWithContext (#164) (ealush)
- 2fcaeda patch: remove global counters from "live" state. (#176) (ealush)
- 72decaf patch: consolidate state into a single source of truth (ealush)
- ce5edda lint: Add lint rules (ealush)
- cff3dbc test: isGroupExcluded (ealush)
- febca2e patch: simplify singleton (#188) (ealush)
- 6c9a18f patch: Move anyone/any to its own bundle (ealush)
- 8e5add2 update jsdoc (ealush)
- bd67de2 patch: stringify rollup-plugin-replace values (ealush)
- c2eddc9 spec: Improve async tests specs (ealush)

## n4s: [2.0.0] - 2020-06-20

### Changed or removed

- 146d31b breaking: add "extend" interface (#189) (ealush)

## vest: [1.0.10] - 2020-05-07

### Added

- 3c17e85 added: runWithContext interface (ealush)

### Fixed and improved

- 1d1871b fix: use default values when field not found in output methods (ealush)
- 89aaeff fix: Temporarily remove ts typings (ealush)
