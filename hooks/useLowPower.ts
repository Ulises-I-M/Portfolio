"use client";

import { useEffect, useState } from "react";

/**
 * Detects low-resource devices based on available CPU cores and RAM.
 * Returns true when hardwareConcurrency < 4 OR deviceMemory < 4 GB.
 * Falls back to false on SSR (window not available).
 */
export function useLowPower(): boolean {
  const [lowPower, setLowPower] = useState(false);

  useEffect(() => {
    const cores = navigator.hardwareConcurrency ?? 8;
    const mem   = (navigator as { deviceMemory?: number }).deviceMemory ?? 8;
    setLowPower(cores < 4 || mem < 4);
  }, []);

  return lowPower;
}
