"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

export function ScrollManager() {
  const pathname = usePathname();

  // Prevent the browser from automatically restoring scroll position,
  // which can cause visual jumps between route changes.
  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // On every route change, immediately scroll to the top (no flash).
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
