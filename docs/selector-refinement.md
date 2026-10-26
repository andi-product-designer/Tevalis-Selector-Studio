# Selector refinement

The Report Sites and Menu Push prototypes retain the existing Tevalis palette, fonts and containers. This revision adds:
- Direct typing into an accessible destination combobox, duplicate-site identity and location, and a distinct confirmation step.
- Viewport-aware popup placement with bounded results, fixed search/status areas and completion controls.
- Search within the full selected set by name, ID/code and parent path, independent of the main query.
- Labelled transfer actions and disabled states at membership/order boundaries.
- Windowed rendering above 100 results while matching against the full catalogue.
- Collapsible reviewer scenarios.

## Selection contract
Parent indicators use the original tree. Filtered parent actions affect matching descendants only; this remains a proposal awaiting Product sign-off. A matching parent still reveals all its descendants. Selection and membership remain stable IDs, and undo continues to restore exact snapshots and order.

## Verification
The Verify selectors pull-request workflow runs unit/interaction tests, TypeScript, a static build, and Chromium checks at 1280 × 900 and 390 × 844. Screenshots and measured timings are uploaded as the selector-verification artifact.

Append ?dataset=5000 to /sites-report/ or /menu-push/ to use the deterministic 5,000-row illustrative catalogue. Timing is measured from the input event to the first animation frame after the matching results commit, including the 150 ms debounce. Over-200 ms samples are flagged, not silently treated as passing performance. CI machine results do not replace measurements on supported customer hardware.

## Remaining development handoff
The production ASP.NET applications are outside this prototype repository. Their control libraries and versions, configuration-only capabilities, shared-template coverage, full affected-control inventory, and rollout estimates still need the development audit. No original tab/company relationships or access restrictions are inferred.
