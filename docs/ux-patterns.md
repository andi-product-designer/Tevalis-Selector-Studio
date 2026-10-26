# Tevalis searchable selectors prototype

A clickable prototype covering every list pattern in the brief, styled to match the current Tevalis back office (navy header #1F3A5F, action blue #5B8BD0, grey panels). All data is made up: about 300 sites with similar names, IDs and regions, plus discounts, promotions, products and functions. It saves nothing and pushes nothing for real.

## Pages
- **Home**: list of the patterns and the test scenarios from the brief.
- **A. Select sites for a report** (Business Analytics): Region > Area > Site tree with search, part-ticked groups, "Check all" only for what is shown, and a count of selected sites.
- **A. Discounted products** (CM): product group > product tree with the same rules, searching by name or stock code.
- **B. Choose site for menu push** (EPOS Designer): search box that picks one site, shows ID and region to tell look-alike sites apart, and has a separate confirm step so Enter never starts the push.
- **C. Navigation rail** (Discounts, Promotions, Company Groups): search above the record list; the details pane stays as it is, with a warning when the open record is hidden by the search and has unsaved changes.
- **C. Checklist dropdowns**: Runs At Sites and Price Groups, with search pinned at the top and a summary of everything ticked.
- **D. Two-list transfer** (Manager Functions): a search box for each list, move buttons, and up/down arrows that work on the full order.
- **Multi-pane** (Product Groups): groups, products and measures with separate filters, and an explanation when a list is empty because of a filter.

## Rules for every list
- Search box always visible, matches name or ID regardless of case, matched text highlighted, about 150 ms delay.
- Shows "n of N" and "No matches for '...'", and tells apart an empty list from a search with no results.
- Ticks and selections are kept when searching or clearing; the clear (x) button appears only when there is text.
- Keyboard: arrow keys move, Enter picks, Escape clears the search and then closes.
- Bulk actions say exactly how many items they affect, including ticked items hidden by the current search.

## Technical details
- TanStack routes, one per pattern, with a shared Tevalis-style shell in __root.
- Shared hooks for filtering, highlighting and selection; selection is stored by ID.
- Design tokens in styles.css.
- Tests for the selection rules (ticks kept on clear, scope of filtered Check all, transfer membership).
