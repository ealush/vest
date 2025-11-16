Phase 1: Planning
Analyze Request
You want to integrate tsdown as the build tool for your monorepo, leveraging its workspace feature. The integration should:

Build each package into its own dist folder (bundles) and types folder (declaration files).
Support auto-generating package exports (exports, main, module, types fields).
Ensure the main file in each package matches the package name.
Preserve unique output filenames and TypeScript path aliases as currently configured.
Delegate Research
I will now invoke the planning-subagent to:

Review the full tsdown documentation (including workspace and package exports features).
Analyze your current monorepo structure and build outputs.
Identify how to configure tsdown for per-package builds, type output, exports, and path aliasing.
Return findings on required config files, CLI usage, and migration steps.
Next Steps
Await research findings.
Draft a multi-phase TDD plan for integrating tsdown across the monorepo.
Present the plan for your approval.
Current Phase: Planning
Plan Phases: 0 of N
Last Action: Analyzing requirements and delegating research
Next Action: Gather research findings and draft plan

#todos

Research tsdown integration for monorepo

Plan: Integrate tsdown Build Tool in Monorepo
Integrate tsdown as the build tool for all packages in the monorepo, using its workspace feature. Each package will output bundles to its own dist folder, types to a types folder, and auto-generate package exports. The main file in each package will match the package name, and TypeScript path aliases will be preserved.

Phases (5)

Phase 1: Prototype tsdown in One Package

Objective: Set up and validate tsdown build for a single package.
Files/Functions to Modify/Create: packages/<sample>/tsdown.config.ts, package.json, sample source files.
Tests to Write: Build output test, type output test, exports field test.
Steps:
Write failing tests for expected build outputs and exports.
Create tsdown.config.ts with entry, outDir, types, exports, and alias.
Run tsdown build and verify tests pass.
Phase 2: Expand tsdown to All Packages

Objective: Add tsdown configs to all packages and validate builds.
Files/Functions to Modify/Create: All packages/\*/tsdown.config.ts, all package.json.
Tests to Write: Build output tests for each package, type output tests, exports field tests.
Steps:
Write failing tests for all package outputs and exports.
Add/modify tsdown.config.ts in each package.
Run builds and verify tests pass.
Phase 3: Add Workspace Build Config

Objective: Enable workspace-wide builds using tsdown.workspace.ts.
Files/Functions to Modify/Create: tsdown.workspace.ts in repo root, root package.json scripts.
Tests to Write: Workspace build test, all package outputs and exports.
Steps:
Write failing test for workspace build.
Create tsdown.workspace.ts listing all packages.
Add root build script and verify tests pass.
Phase 4: Migrate Exports and Remove Legacy Build Scripts

Objective: Remove legacy build configs/scripts and ensure exports are auto-generated.
Files/Functions to Modify/Create: All package.json, old build configs/scripts.
Tests to Write: Exports field test, legacy script removal test.
Steps:
Write failing tests for exports and absence of legacy scripts.
Remove manual exports and old build scripts.
Verify tests pass and exports are correct.
Phase 5: Validate Path Aliases and Unique Filenames

Objective: Ensure TypeScript path aliases and unique output filenames work as before.
Files/Functions to Modify/Create: All tsdown.config.ts, tsconfig.json files.
Tests to Write: Path alias resolution test, unique filename test.
Steps:
Write failing tests for alias and filename resolution.
Update configs to match current aliasing and output.
Verify tests pass.

1. let's leave the legacy build alone, create a new package.json #file:packageJson.js is the template. update everything there as well
2. yes. always.
3. no, just keep the current ./dist ./types ./exports per package
   4/5. exports should be created for the following:
   a. entry points
   b. each package may have ./src/exports - the files there should be outputted as their own exports and dist files as well similar to how it works today. Read the existing #file:exports and dist and types folders for example and see that they include both entry and exports
