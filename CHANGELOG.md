# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## vest: [3.1.0] - 2021-01-21

### Added
- 8458837  minor: support schema skip and only (#557) (Evyatar)
- 0cf5615  minor: support custom message in test (#560) (Evyatar)

## vest: [3.0.2] - 2021-01-20

### Fixed and improved
- 736001f  fix: custom enforce rules typings (ealush)

## vest: [3.0.0] - 2021-01-08

### Changed or removed

- 3d47fb1 breaking: remove vest.draft() (#474) (Evyatar)
- 0ef8ec8 breaking: remove validate (ealush)
- 00a5aba breaking: remove global state reference (ealush)

### Added

- b8746f9 feat: suite.remove (ealush)
- 4dd6a30 feat: test.each (#541) (Alex Kaplan)
- 4c81bc0 added: enforce.loose for loose shape enforcement style #492 (#505) (Alex Kaplan)
- 8e3386b Added: Chaining support in lazy enforcement (#495) (Evyatar)

### Fixed and improved

- ede4587 test: add tests for VestTest.cancel (ealush)
- f3bb418 patch: optionalFunctionValue utility (ealush)
- 81f3a4d fix: retain lagging list after reset (ealush)
- 61d6258 tests: improve rule test fixture (ealush)
- 8d0b087 tests: runLazyRule (ealush)
- 0006059 patch: reduce transpiled bundle size (#522) (Evyatar)
- 52691b0 patch: update dev mode errors (ealush)
- c3949bd patch: improve enforcement performance on legacy browsers (#507) (Evyatar)
- 3083ba4 patch: use rules for internal comparisons (ealush)
- 26d6bed patch: move anyone package inside (#502) (Evyatar)
- 56b195d patch: use isPromise utility (#501) (Evyatar)
- eb43009 patch: use enforce rules for internal evaluations (ealush)
- b8c8b6c patch: move severity profile logic out (#496) (Evyatar)
- 458bccd readme: add a discord invite link (Evyatar)
- c3e4449 patch: sort out organize deps (ealush)
- 797fe4e patch: reduce built size (#465) (Evyatar)
- 92924df fix: use proxy with ensure (ealush)
- 1d6955d patch: simplify conditions (ealush)
- c6b36f2 patch: remove state init symbol (ealush)
- 4dd0132 patch: Move state modules to the same directory (ealush)
- 65a7468 patch: Remove state history (ealush)
- 699b293 use context.bind (ealush)
- b080130 patch: rewrite state module (ealush)
- e5eac8f patch: remove context around async test (ealush)
- 9de029c patch: simplify cache (ealush)
- 1474825 test: remove runSpec module (ealush)
- 1a69910 types: isUndefined rule (ealush)
- b20aa66 patch: regorganize Context and Suite State (#413) (Evyatar)
- ca5dda1 fix: README typos (#392) (baahrens)

## n4s: [3.0.0] - 2021-01-08

### Changed or removed

- bbe0159 breaking: Remove ensure export as it is now replaced by the lazy enforce interface (#497) (Evyatar)

### Added

- 2f948fc feat: deeply nested schema result (#555) (Evyatar)
- c2ea710 added: allOf compound rule (#533) (Moses3301)
- db7f6f4 added: oneOf compound (#526) (hpsharon)
- 54e500f feature: templates (#509) (Evyatar)
- c0053f2 added: anyOf for either/or style enforcements #269 (#493) (Alex Kaplan)
- 670887d added: isArrayOf rule #488 (#499) (Moses3301)
- 7df6371 added: rule: isBoolean (#494) (Evyatar)
- f3ff232 minor: Add shape validator (#491) (Evyatar)
- 3e33fa8 added: lazy evaluated enforcements (#479) (Evyatar)
- a54e455 added: isNegative & isPositive (#433) (Ganesh Patil)
- eecb59a feat: rule isBetween and isNotBetween (#419) (Daniel Hermon)
- 17f74e1 added: startsWith rule (#414) (Daniel Hermon)
- d77d569 added: endsWith and doesNotEndWith rules (#409) (Daniel Hermon)
- a424282 added: `isNull` rule. (#404) (omri lugasi)
- a13e860 added: isUndefined rule(#410) (omri lugasi)

### Fixed and improved

- 4059180 patch: inverse arg control for more correct lazy rule flow (#500) (Evyatar)
- cbee269 patch: Use own modules (#476) (Evyatar)
- 98bd1d1 patch: bindNot for rules (ealush)

## vest: [2.2.3] - 2020-09-16

### Fixed and improved

- 870dd86 fix: notEquals typings (ealush)
- d7db9c3 patch: extract business logic out of context module (#382) (ealush)
- 765dea2 fix: get/reset suite typings (gaspoute)

## vest: [2.2.0] - 2020-09-08

### Added

- 9e96ca6 FEAT: get and reset as properties of createSuite result (#330) (vligas)
- b633f09 FEAT: use Jest assertion return api (#349) (vligas)

### Fixed and improved

- c1846d1 types: add vest.reset and vest.get types (#333) (ealush)
- 1985f28 build: Add **dev** global to the development build (#366) (gaweki)
- a694c68 patch: Create a "suite" core folder (#351) (NorbertLuszkiewicz)
- dca5b3b FIX: rules do not exist on type 'EnforceExtendMap' (#377) (ealush)

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

- 062c40a added: add isNaN rule (#300) (ealush)

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
