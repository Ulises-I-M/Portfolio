"use client";

import { useCallback, useState } from "react";

/**
 * Paging shared by the detail panel's gallery and the full-screen viewer.
 *
 * The state lives above both so they stay on the same frame: page through in
 * the viewer, close it, and the panel is showing what you were just looking at.
 * Direction rides along with the index because the slide has to know which way
 * the frame is travelling.
 */
export function useGalleryPaging(count: number) {
  const [[index, direction], setPage] = useState<[number, number]>([0, 0]);

  const paginate = useCallback(
    (step: number) => {
      if (count < 2) return;
      setPage(([i]) => [(i + step + count) % count, step]);
    },
    [count],
  );

  const goTo = useCallback((i: number) => {
    setPage(([cur]) => [i, i > cur ? 1 : -1]);
  }, []);

  return { index, direction, paginate, goTo };
}
