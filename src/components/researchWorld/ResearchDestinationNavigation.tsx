"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

const primaryDestinations = [
  { label: "Start", href: "/", pathname: "/" },
  { label: "World", href: "/world", pathname: "/world" },
  { label: "Workshop", href: "/builder", pathname: "/builder" }
] as const;

const researchTools = [
  { label: "Atlas", href: "/atlas", pathname: "/atlas" },
  { label: "Lab", href: "/lab", pathname: "/lab" },
  { label: "Experiments", href: "/world?task=experiment", pathname: "/world", task: "experiment" },
  { label: "Compare runs", href: "/world?task=compare", pathname: "/world", task: "compare" }
] as const;

export function ResearchDestinationNavigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTask = searchParams.get("task");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const researchToolCurrent = researchTools.some((tool) => isToolCurrent(tool, pathname, currentTask));

  useEffect(() => {
    if (!menuOpen) {
      return;
    }
    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpen]);

  function openMenu(focusIndex?: number) {
    setMenuOpen(true);
    if (focusIndex !== undefined) {
      window.requestAnimationFrame(() => itemRefs.current[focusIndex]?.focus());
    }
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openMenu(0);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      openMenu(researchTools.length - 1);
    }
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLAnchorElement>, index: number) {
    const nextIndex =
      event.key === "ArrowDown"
        ? (index + 1) % researchTools.length
        : event.key === "ArrowUp"
          ? (index - 1 + researchTools.length) % researchTools.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? researchTools.length - 1
              : null;

    if (nextIndex !== null) {
      event.preventDefault();
      itemRefs.current[nextIndex]?.focus();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setMenuOpen(false);
      triggerRef.current?.focus();
    }
  }

  return (
    <nav className="research-destination-nav" aria-label="Primary navigation">
      <ul className="research-destination-nav__list">
        {primaryDestinations.map((destination) => {
          const current =
            destination.pathname === "/"
              ? pathname === "/"
              : destination.pathname === "/world"
                ? pathname.startsWith(destination.pathname) && currentTask !== "experiment" && currentTask !== "compare"
                : pathname.startsWith(destination.pathname);
          return (
            <li key={destination.label}>
              <Link href={destination.href} className="research-destination-nav__link" aria-current={current ? "page" : undefined}>
                {destination.label}
              </Link>
            </li>
          );
        })}
        <li>
          <div className="research-tools-menu" ref={menuRef}>
            <button
              ref={triggerRef}
              type="button"
              className="research-destination-nav__link research-tools-menu__trigger"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              data-current={researchToolCurrent ? "true" : "false"}
              onClick={() => setMenuOpen((open) => !open)}
              onKeyDown={handleTriggerKeyDown}
            >
              Research tools
            </button>
            {menuOpen ? (
              <ul className="research-tools-menu__popover" role="menu" aria-label="Research tools">
                {researchTools.map((tool, index) => {
                  const current = isToolCurrent(tool, pathname, currentTask);
                  return (
                    <li key={tool.label} role="none">
                      <Link
                        ref={(element) => {
                          itemRefs.current[index] = element;
                        }}
                        role="menuitem"
                        href={tool.href}
                        aria-current={current ? "page" : undefined}
                        onClick={() => setMenuOpen(false)}
                        onKeyDown={(event) => handleMenuKeyDown(event, index)}
                      >
                        {tool.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </li>
      </ul>
    </nav>
  );
}

function isToolCurrent(
  tool: (typeof researchTools)[number],
  pathname: string,
  currentTask: string | null
): boolean {
  if ("task" in tool) {
    return pathname.startsWith(tool.pathname) && currentTask === tool.task;
  }
  return pathname.startsWith(tool.pathname);
}
