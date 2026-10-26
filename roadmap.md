# Selector review revision
- [x] Separate overall tree state from filtered actions; add selected-item review.
- [x] Preserve selected site IDs and compact large selections.
- [x] Complete keyboard selection, focus return and control relationships.
- [x] Keep rail highlights within complete record names.
- [x] Complete multi-pane tabs, Company Group selector and search composition.
- [x] Test selection rules and verify revised user flows.

Acceptance decisions outside this revision: Product sign-off for matching-descendant parent actions; original tab column/company relationships; 5,000-row performance, screen-reader and ASP.NET integration checks.

# Selection recovery
- [x] Remove AI suggestions and model endpoint; retain selection recovery.
- [x] Add session-wide undo for selection, transfer and ordering changes.
- [x] Apply uploaded review refinements: reset destination confirmation and keep removal focus.
- [x] Test selection recovery.
# Tab crash recovery
- [x] Replace the failing shared tab dependency and verify both tabbed selector journeys.
