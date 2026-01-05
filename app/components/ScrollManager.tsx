"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

export function ScrollManager() {
  const pathname = usePathname();

  // Lai pārlūks pats nemēģina "atjaunot" scrollu un nerada lēcienus
  useLayoutEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // Uz katru jaunu lapu: vienmēr uz augšu uzreiz (bez "flash")
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
