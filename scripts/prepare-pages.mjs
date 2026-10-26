import { access, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const output = fileURLToPath(new URL("../dist/client/", import.meta.url));
const routes = [
  "",
  "sites-report",
  "discounted-products",
  "menu-push",
  "navigation-rail",
  "checklists",
  "transfer",
  "multi-pane",
];

// Require a real HTML entry for every demo so shared links and refreshes work
// on GitHub Pages without a server-side SPA rewrite.
await Promise.all(routes.map((route) => access(join(output, route, "index.html"))));
await writeFile(join(output, ".nojekyll"), "");
console.log(`GitHub Pages output ready: ${routes.length} prerendered routes.`);
