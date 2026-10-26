import { useEffect, useMemo, useState } from "react";
import { sites, siteTree, type Site } from "./data";
import type { TreeNode } from "./selection";

/** Deterministic illustrative data for repeatable scale checks; never company restrictions. */
export function createSiteCatalogue(count: number): Site[] {
  return Array.from({ length: count }, (_, index) => {
    const source = sites[index % sites.length]!;
    return { ...source, id: "S" + (1001 + index),
      name: index % 97 === 0 ? source.name + " – Conference and Events at the Riverside Pavilion" : source.name };
  });
}
export function createSiteTree(catalogue: Site[]): TreeNode[] {
  const regions = new Map<string, Map<string, Site[]>>();
  for (const site of catalogue) {
    if (!regions.has(site.region)) regions.set(site.region, new Map());
    const areas = regions.get(site.region)!;
    if (!areas.has(site.area)) areas.set(site.area, []);
    areas.get(site.area)!.push(site);
  }
  return Array.from(regions, ([region, areas]) => ({
    id: "r:" + region, name: region,
    children: Array.from(areas, ([area, entries]) => ({
      id: "a:" + area, name: area,
      children: entries.map((site) => ({ id: site.id, name: site.name, code: site.id, meta: region + " › " + area })),
    })),
  }));
}
export function useSiteCatalogue() {
  const [large, setLarge] = useState(false);
  useEffect(() => { setLarge(new URLSearchParams(window.location.search).get("dataset") === "5000"); }, []);
  return useMemo(() => {
    if (!large) return { sites, tree: siteTree };
    const catalogue = createSiteCatalogue(5000);
    return { sites: catalogue, tree: createSiteTree(catalogue) };
  }, [large]);
}
