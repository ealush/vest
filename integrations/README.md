# Ecosystem integration workspaces

Each directory below `integrations/` is a private consumer workspace. It must import Vest and the released third-party package only through their public entry points. Framework dependencies stay in that integration's workspace; shared fixtures and contracts belong in `@vest/integration-kit`.

## Adding an integration

1. Create a private workspace with `test`, `typecheck`, and `build` scripts.
2. Record the exact tested versions and honest capability limits in `kit/src/registry.ts`.
3. Run `yarn integrations:verify` and build the website.
4. Add the first-party page from the same implementation source.
5. Prepare and locally review an upstream patch.

Do not push an external branch, open an issue, or open a pull request without explicit human approval. The Vest-side proof must be merged or publicly available first.

`vx` release discovery only enumerates `packages/*`; integration workspaces are therefore outside the release set. The integration runner also refuses to run any workspace whose package manifest is not marked `private: true`.
