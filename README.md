# Tevalis Selector Studio

Interactive prototypes of searchable selectors for Tevalis back-office apps.

**Team staging:** https://andi-product-designer.github.io/Tevalis-Selector-Studio/

The prototype uses made-up data. Reports and menu pushes are simulated, and
selection history is held in the browser session. No database credentials are
required for the GitHub Pages build.

## Development

Use Node.js 22.12 or newer and Bun. The checked-in `bun.lock` is the dependency
lockfile used by CI.

```sh
git clone https://github.com/andi-product-designer/Tevalis-Selector-Studio.git
cd Tevalis-Selector-Studio
bun install --frozen-lockfile
bun run dev
```

## Checks and builds

```sh
bun run test
bun run build:pages
```

`build:pages` uses `vite.pages.config.ts` to prerender all eight demo routes to
`dist/client`. Each route gets its own `index.html`, so opening a shared deep
link or refreshing a page works on GitHub Pages. The router and asset paths use
the configured Vite base path.

`bun run build` creates the same static prototype for a root URL.
`bun run build:pages` configures the team staging subpath.

## Staging deployment

In repository **Settings → Pages**, select **GitHub Actions** as the source.
The **Deploy staging to GitHub Pages** workflow tests and publishes each push to
`main`. It can also be run manually from the Actions tab. Only `dist/client` is
published; server output is excluded.

The workflow derives the site base path from GitHub Pages. For a local static
build, it defaults to `/Tevalis-Selector-Studio/`; set `PAGES_BASE_PATH` to override.

## UX scope

- Site trees for reporting and product trees for discounts.
- Single-site selection for simulated menu pushes.
- Searchable navigation rails and checklist dropdowns.
- Available / In Use transfer lists with stable ordering.
- Company product groups with independent searches across panes and tabs.
- Session-wide selection history and undo.

See `docs/ux-patterns.md` for the design brief and `AGENTS.md` for interaction
rules. All examples use illustrative data and run entirely in the browser.
No authentication, database, analytics, or external service configuration is required.
