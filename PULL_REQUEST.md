# Decouple Focus Logic (`IsolateFocused`) from AST Node Structure

## Summary

This PR fundamentally refactors how Vest handles `.only` and `.skip` execution boundaries. Previously, focus logic constraints (specifically the implicit `ONLY` trait) were tracked directly on the structural AST nodes (via a `_hasImplicitOnly` flag decorated on the Isolate).

To cleanly separate orthogonal concerns (tree structure vs orchestrating execution focus), this PR fully extracts focus management mechanisms and integrates them firmly into the `VestRuntime` root state context.

## Key Architecture Changes

1. **Clean Isolate Interface**:
   - `Isolate` no longer handles or exposes any knowledge of `HasImplicitOnly`.
   - Structural nodes (Test, Suite, Group) are now agnostically focused purely on modeling history and status properties.
2. **Centralized Focus Registry**:
   - The Root Execution State (`StateRef` inside `VestRuntime`) introduces an `implicitOnlyNodes` `Set`.
   - When an `IsolateFocused` node declaring an `ONLY` mode is instantiated, it natively logs its physical `parent` node into this master traversal Set (`useX().stateRef.implicitOnlyNodes.add(currentIsolate)`).
3. **$O(Depth)$ Traversal Preserved**:
   - `hasImplicitOnly()` still operates with hyper-efficient $O(Depth)$ lookups climbing lexically, but now queries against the centralized runtime registry (`registry.has(current)`) rather than sniffing dynamically typed flags on arbitrary AST objects.

## Updates in this PR:

- **`IsolateKeys.ts` / `IsolateTypes.ts` / `Isolate.ts`**: Stripped out all tracking of `HasImplicitOnly` and restored pure Isolate constructors.
- **`VestRuntime.ts`**: Introduced the `implicitOnlyNodes` Set. Adapted `useSetNextIsolateChild` and `hasImplicitOnly` to work entirely against this boundary tracker.
- **`VestRuntime.test.ts`**: Added explicit tests verifying execution boundaries (correct set-registry updates via `useSetNextIsolateChild`, and accurate look-up responses via `useIsFocusedOut` and `hasImplicitOnly`). All other tests remain passing.
- **`docs/Isolates.md`**: Updated documentation detailing how focus capabilities rely on the central `StateRef` registry and outlining the specific traversal patterns.
