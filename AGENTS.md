<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Selector architecture
- Keep separate TanStack content routes for selector patterns and share pure selection helpers; this keeps demonstration flows independent and selection rules testable.
- Compute tree parent state from original nodes while action scope comes from filtered nodes; this prevents search from changing the meaning of selection indicators.
- Store selection by stable IDs and render identity-preserving SelectedReview lists; duplicate names must remain distinguishable.
- Keep company, page and per-tab search state above the multi-pane tab panels; switching tabs must not erase independent queries.
- Company groups share the sample catalogue and Product Types/Measures use illustrative group relationships until original screen data is supplied; avoid implying real company restrictions.
- Filtered parent actions remain the proposed matching-descendant interpretation pending Product sign-off; do not silently broaden action scope.
- Keep session-wide selection snapshots in the root SelectionHistoryProvider and commit transfer membership atomically; undo must preserve exact order across route navigation without changing search or executing actions.
- Use the shared React-native tab controls with design-system buttons and roving keyboard focus; this avoids the preview's repeatedly stale Radix Tabs dependency graph while retaining accessible tab behavior.
