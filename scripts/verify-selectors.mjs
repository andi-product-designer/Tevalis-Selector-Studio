import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const base = process.env.SELECTOR_TEST_URL || "http://127.0.0.1:4173";
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await mkdir("artifacts/selectors", { recursive: true });
const metrics = [];
async function open(path) {
  await page.goto(base + path);
  await page.getByRole("heading", { level: 1 }).waitFor();
}
async function bounded(locator) {
  const box = await locator.boundingBox();
  assert(box, "Popup must be visible");
  const viewport = page.viewportSize();
  assert(box.x >= 0 && box.y >= 0 && box.x + box.width <= viewport.width + 1 && box.y + box.height <= viewport.height + 1,
    "Popup must fit the viewport: " + JSON.stringify(box));
}
async function measure(input, query, countText) {
  await input.evaluate((element, expected) => {
    window.__selectorTiming = null;
    element.addEventListener("input", () => {
      const start = performance.now();
      const observer = new MutationObserver(() => {
        const countFound = Array.from(document.querySelectorAll("p")).some((p) => p.textContent === expected.countText);
        const matchFound = Array.from(document.querySelectorAll("mark")).some((mark) => mark.textContent.toLowerCase() === expected.query.toLowerCase());
        if (countFound && matchFound) {
          observer.disconnect();
          requestAnimationFrame(() => { window.__selectorTiming = performance.now() - start; });
        }
      });
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
      window.setTimeout(() => observer.disconnect(), 4000);
    }, { once: true });
  }, { countText, query });
  await input.fill(query);
  await page.waitForFunction(() => window.__selectorTiming !== null);
  return await page.evaluate(() => window.__selectorTiming);
}
try {
  // Both priority-one selectors use the same deterministic large catalogue.
  await open("/sites-report/?dataset=5000");
  await page.getByRole("button", { name: "Select Sites", exact: true }).click();
  let search = page.getByRole("searchbox", { name: "Search sites by name or ID" });
  await page.getByText("5000 of 5000", { exact: true }).waitFor();
  for (const { query, count } of [{ query: "Yorkshire", count: 850 }, ...["S6000", "S5999", "S5998", "S5997", "S5996"].map((query) => ({ query, count: 1 }))]) {
    metrics.push({ selector: "report tree", query, ms: await measure(search, query, count + " of 5000") });
  }
  await search.press("Enter");
  assert.equal(await page.getByRole("button", { name: "Done · 1 sites selected" }).count(), 1);
  await search.fill("S1002");
  await page.getByRole("treeitem").filter({ hasText: "S1002" }).waitFor();
  await search.press("Enter");
  await page.getByRole("button", { name: "Review selected · 2 sites" }).click();
  const reviewSearch = page.getByRole("searchbox", { name: "Search selected sites" });
  await reviewSearch.fill("S5996");
  await page.getByRole("button", { name: /Remove .*S5996/ }).click();
  assert.equal(await search.inputValue(), "S1002");
  await page.getByRole("button", { name: "Hide selected · 1 sites" }).click();
  await bounded(page.getByRole("dialog", { name: "Select report sites" }));
  await page.screenshot({ path: "artifacts/selectors/report-desktop.png" });
  await search.press("Escape"); await search.press("Escape");
  assert.equal(await page.getByRole("dialog").count(), 0);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await page.getByRole("button", { name: "Select Sites", exact: true }).click();
  await page.getByRole("button", { name: "Done · 2 sites selected" }).waitFor();

  await open("/menu-push/?dataset=5000");
  let combo = page.getByRole("combobox", { name: "Destination site" });
  await combo.click();
  await page.getByText("5000 of 5000 sites", { exact: true }).waitFor();
  assert((await page.getByRole("option").count()) < 30);
  for (const { query, count } of [{ query: "Yorkshire", count: 850 }, ...["S6000", "S5999", "S5998", "S5997", "S5996"].map((query) => ({ query, count: 1 }))]) {
    metrics.push({ selector: "destination combobox", query, ms: await measure(combo, query, count + " of 5000 sites") });
  }
  await bounded(page.locator('[role="listbox"]').locator(".."));
  await page.screenshot({ path: "artifacts/selectors/menu-desktop.png" });
  await combo.press("Enter");
  assert(await page.getByRole("button", { name: "Push menu…" }).isEnabled());
  assert.equal(await page.getByRole("region", { name: "Confirm push" }).count(), 0);
  await page.getByRole("button", { name: "Push menu…" }).click();
  await page.getByRole("region", { name: "Confirm push" }).waitFor();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();

  for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 900 }]) {
    await page.setViewportSize(viewport);
    const size = viewport.width < 500 ? "narrow" : "desktop";
    await open("/sites-report/");
    await page.getByRole("button", { name: "Select Sites", exact: true }).click();
    await bounded(page.getByRole("dialog", { name: "Select report sites" }));
    assert(await page.getByRole("button", { name: "Done · 0 sites selected" }).isVisible());
    await page.screenshot({ path: "artifacts/selectors/report-" + size + ".png" });
    await open("/menu-push/");
    combo = page.getByRole("combobox");
    await combo.fill("crown");
    await page.getByRole("option").first().waitFor();
    await bounded(page.getByRole("listbox").locator(".."));
    await page.screenshot({ path: "artifacts/selectors/menu-" + size + ".png" });
    await open("/checklists/");
    await page.getByRole("button", { name: "Runs At Sites", exact: true }).click();
    await bounded(page.getByRole("dialog", { name: "Runs At Sites", exact: true }));
    await page.screenshot({ path: "artifacts/selectors/checklist-" + size + ".png" });
    await open("/transfer/");
    assert(!(await page.getByRole("button", { name: "Add to In Use", exact: true }).isEnabled()));
    await page.getByRole("listbox", { name: "Available Functions" }).getByRole("option", { name: "Refund", exact: true }).click();
    await page.getByRole("button", { name: "Add to In Use", exact: true }).click();
    await page.getByRole("listbox", { name: "Functions In Use" }).getByRole("option", { name: /Refund/ }).waitFor();
    await page.getByRole("button", { name: "Undo", exact: true }).click();
    await page.getByRole("listbox", { name: "Available Functions" }).getByRole("option", { name: "Refund", exact: true }).waitFor();
    await page.screenshot({ path: "artifacts/selectors/transfer-" + size + ".png" });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "No horizontal document overflow");
  }
  assert.deepEqual(errors, [], "No browser runtime errors");
  const summary = ["# Selector verification", "", "Chromium CI runner, 5,000 illustrative records. Input event to first animation frame after matching results commit; includes the 150 ms debounce. This is a CI benchmark, not a guarantee for all user devices.", "", "| Selector | Query | Response (ms) | Target |", "|---|---|---:|---|",
    ...metrics.map((m) => "| " + m.selector + " | " + m.query + " | " + m.ms.toFixed(1) + " | " + (m.ms < 200 ? "Under 200 ms" : "OVER 200 ms — investigate") + " |")].join("\n");
  console.log(summary);
  await writeFile("artifacts/selectors/performance.md", summary);
  await writeFile("artifacts/selectors/performance.json", JSON.stringify(metrics, null, 2));
  if (metrics.some((m) => m.ms >= 200)) console.warn("::warning::At least one 5,000-row filter response exceeded 200 ms; see performance artifact.");
} catch (error) {
  await page.screenshot({ path: "artifacts/selectors/failure.png", fullPage: true });
  await writeFile("artifacts/selectors/failure.txt", String(error));
  throw error;
} finally {
  await browser.close();
}
