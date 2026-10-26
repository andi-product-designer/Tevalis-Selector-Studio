// Pure selection/filter logic shared by every selector pattern.
export type TreeNode = { id: string; name: string; code?: string; meta?: string; children?: TreeNode[] };

export function textMatches(q: string, ...fields: (string | undefined)[]) {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  return fields.some((f) => f?.toLowerCase().includes(s));
}

/** Matching parent reveals all children; matching child reveals its ancestor path. */
export function filterTree(nodes: TreeNode[], q: string): TreeNode[] {
  if (!q.trim()) return nodes;
  const out: TreeNode[] = [];
  for (const n of nodes) {
    if (textMatches(q, n.name, n.code)) out.push(n);
    else if (n.children) {
      const c = filterTree(n.children, q);
      if (c.length) out.push({ ...n, children: c });
    }
  }
  return out;
}

export function leaves(nodes: TreeNode[]): TreeNode[] {
  return nodes.flatMap((n) => (n.children ? leaves(n.children) : [n]));
}

export function setMany(selected: Set<string>, ids: string[], on: boolean) {
  const next = new Set(selected);
  ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
  return next;
}

export function groupState(node: TreeNode, selected: Set<string>): "none" | "some" | "all" {
  const l = leaves([node]);
  const c = l.filter((x) => selected.has(x.id)).length;
  return c === 0 ? "none" : c === l.length ? "all" : "some";
}

/** State comes from the original tree; action scope comes from the filtered tree. */
export function groupSelection(full: TreeNode, shown: TreeNode, selected: Set<string>) {
  const all = leaves([full]);
  const matching = leaves([shown]);
  return {
    state: groupState(full, selected),
    selected: all.filter((n) => selected.has(n.id)).length,
    total: all.length,
    matchingIds: matching.map((n) => n.id),
    allMatchingSelected: matching.length > 0 && matching.every((n) => selected.has(n.id)),
  };
}

export function selectedIdentity(item: { name: string; id: string }) {
  return `${item.name} (${item.id})`;
}

export function priceMatches(q: string, product: { name: string; code: string; price: number }) {
  return textMatches(q, product.name, product.code, product.price.toFixed(2), `£${product.price.toFixed(2)}`);
}

/** Move ids from source to target membership (target keeps full order, appended). */
export function transfer(from: string[], to: string[], ids: string[]) {
  const set = new Set(ids);
  return { from: from.filter((x) => !set.has(x)), to: [...to, ...from.filter((x) => set.has(x))] };
}

/** Reorder acts on the full unfiltered order. */
export function moveInOrder(order: string[], id: string, dir: -1 | 1) {
  const i = order.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= order.length) return order;
  const next = [...order];
  const t = next[i];
  const other = next[j];
  if (t === undefined || other === undefined) return order;
  next[i] = other;
  next[j] = t;
  return next;
}
