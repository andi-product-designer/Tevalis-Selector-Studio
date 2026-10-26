import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/** Fixed-height rows keep the full catalogue searchable without mounting thousands of controls. */
export function WindowedList({ count, active, rowHeight = 64, id, label, role, multiple, renderRow, empty, className = "" }: {
  count: number; active: number; rowHeight?: number; id: string; label: string;
  role: "tree" | "listbox"; multiple?: boolean;
  renderRow: (index: number, style: CSSProperties) => ReactNode;
  empty?: ReactNode; className?: string;
}) {
  const root = useRef<HTMLUListElement>(null);
  const [scroll, setScroll] = useState(0);
  const [height, setHeight] = useState(320);
  const virtual = count > 100;
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const resize = () => setHeight(el.clientHeight || 320);
    resize();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(resize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || !count) return;
    if (virtual) {
      const top = Math.max(0, Math.min(active, count - 1)) * rowHeight;
      const viewportHeight = el.clientHeight || height;
      if (top < el.scrollTop) el.scrollTop = top;
      else if (top + rowHeight > el.scrollTop + viewportHeight) el.scrollTop = top + rowHeight - viewportHeight;
      setScroll(el.scrollTop);
    }
  }, [active, count, virtual, rowHeight, height]);
  const start = virtual ? Math.max(0, Math.min(count - 1, Math.floor(scroll / rowHeight) - 4)) : 0;
  const end = virtual ? Math.min(count, start + Math.ceil(height / rowHeight) + 9) : count;
  return <ul ref={root} id={id} role={role} aria-label={label} aria-multiselectable={multiple}
    onScroll={(event) => setScroll(event.currentTarget.scrollTop)}
    className={"min-h-0 max-h-80 flex-auto overflow-y-auto overscroll-contain text-sm " + className}>
    {!count && <li role="presentation" className="p-4 text-sm text-muted-foreground">{empty}</li>}
    {start > 0 && <li role="presentation" aria-hidden style={{ height: start * rowHeight }} />}
    {Array.from({ length: end - start }, (_, offset) => renderRow(start + offset, virtual ? { height: rowHeight } : { minHeight: rowHeight }))}
    {end < count && <li role="presentation" aria-hidden style={{ height: (count - end) * rowHeight }} />}
  </ul>;
}
