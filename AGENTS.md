# Tevalis Selector Studio

Preserve published commit history and keep the main branch working.

## Selector architecture
- Keep separate TanStack content routes for selector patterns and share pure selection helpers; this keeps demonstration flows independent and selection rules testable.
- Compute tree parent state from original nodes while action scope comes from filtered nodes; this prevents search from changing the meaning of selection indicators.
- Store selection by stable IDs and render identity-preserving SelectedReview lists; duplicate names must remain distinguishable.
- Keep company, page and per-tab search state above the multi-pane tab panels; switching tabs must not erase independent queries.
- Company groups share the sample catalogue and Product Types/Measures use illustrative group relationships until original screen data is supplied; avoid implying real company restrictions.
- Filtered parent actions remain the proposed matching-descendant interpretation pending Product sign-off; do not silently broaden action scope.
- Keep session-wide selection snapshots in the root SelectionHistoryProvider and commit transfer membership atomically; undo must preserve exact order across route navigation without changing search or executing actions.
- Use the shared React-native tab controls with design-system buttons and roving keyboard focus; this retains accessible tab behavior and consistent keyboard navigation.
