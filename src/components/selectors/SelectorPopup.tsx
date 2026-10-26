import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

export function SelectorPopup({ anchor, id, label, onClose, children, role = "dialog" }: {
  anchor: RefObject<HTMLElement | null>; id: string; label: string; onClose: () => void;
  children: ReactNode; role?: "dialog" | "presentation";
}) {
  const root = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  const [position, setPosition] = useState<CSSProperties>({ visibility: "hidden" });
  useLayoutEffect(() => {
    const place = () => {
      const rect = anchor.current?.getBoundingClientRect();
      if (!rect) return;
      const viewport = window.visualViewport;
      const top = viewport?.offsetTop ?? 0;
      const left = viewport?.offsetLeft ?? 0;
      const height = viewport?.height ?? window.innerHeight;
      const width = viewport?.width ?? window.innerWidth;
      const below = top + height - rect.bottom - 12;
      const above = rect.top - top - 12;
      const upwards = below < 300 && above > below;
      const maxHeight = Math.max(0, Math.min(560, upwards ? above : below));
      const popupWidth = Math.min(rect.width, width - 16);
      setPosition({
        position: "fixed", width: popupWidth, maxHeight,
        left: Math.max(left + 8, Math.min(rect.left, left + width - popupWidth - 8)),
        top: upwards ? undefined : rect.bottom + 4,
        bottom: upwards ? window.innerHeight - rect.top + 4 : undefined,
      });
    };
    const outside = (event: Event) => {
      const node = event.target as Node;
      if (!root.current?.contains(node) && !anchor.current?.contains(node)) close.current();
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    window.visualViewport?.addEventListener("resize", place);
    window.visualViewport?.addEventListener("scroll", place);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", outside);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      window.visualViewport?.removeEventListener("resize", place);
      window.visualViewport?.removeEventListener("scroll", place);
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", outside);
    };
  }, [anchor]);
  return createPortal(
    <div ref={root} id={id} role={role} aria-label={role === "dialog" ? label : undefined}
      style={position} className="z-50 flex min-h-0 flex-col overflow-hidden border border-border bg-popover shadow-lg">
      {children}
    </div>, document.body,
  );
}
