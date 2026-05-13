// ─────────────────────────────────────────────────────────────────────────────
// hooks/usePapers.ts
//
// Replaces the old static @/data/papers file.
// Fetches all research items from the API and exposes the same three lists
// (trendingPapers, allPapers, bestTheses) that the UI components expect.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react"
import { useResearchList } from "@/hooks/useResearch"
import { mapResearchToPaper } from "./mapResearchToPaper"
import type { Paper } from "./paper"

// ── Lightweight best-thesis shape (mirrors the old static bestTheses array) ──
export interface BestThesisEntry {
  rank:           number
  title:          string
  author:         string
  universityName: string
  department:     string
}

export interface UsePapersResult {
  /** Papers sorted by times_viewed descending (top 8) */
  trendingPapers: Paper[]
  /** All remaining papers (not in the trending slice) */
  allPapers:      Paper[]
  /** Papers flagged as best_thesis, ranked by year desc */
  bestTheses:     BestThesisEntry[]
  isLoading:      boolean
  error:          string | null
  /** Manually re-fetch */
  refresh:        () => void
}

export function usePapers(): UsePapersResult {
  const { fetchAll, isLoading, error } = useResearchList()

  const [trendingPapers, setTrending] = useState<Paper[]>([])
  const [allPapers,      setAll]      = useState<Paper[]>([])
  const [bestTheses,     setBest]     = useState<BestThesisEntry[]>([])

  const load = useCallback(async () => {
    const result = await fetchAll()
    if (!result.ok) return

    const papers = result.data.map(mapResearchToPaper)

    // ── Trending: top 8 by times_viewed ──────────────────────────────────────
    const sorted = [...papers].sort(
      (a, b) => (b.timesViewed ?? 0) - (a.timesViewed ?? 0)
    )
    const trending = sorted.slice(0, 8)
    const trendingIds = new Set(trending.map((p) => p.id))

    // ── All: everything not in the trending slice ─────────────────────────────
    const rest = papers.filter((p) => !trendingIds.has(p.id))

    // ── Best theses: papers with bestThesis === true, newest first ────────────
    const best: BestThesisEntry[] = papers
      .filter((p) => p.bestThesis)
      .sort((a, b) => b.year - a.year)
      .map((p, i) => ({
        rank:           i + 1,
        title:          p.title,
        author:         p.author,
        universityName: p.universityName,
        department:     p.department,
      }))

    setTrending(trending)
    setAll(rest)
    setBest(best)
  }, [fetchAll])

  // Fetch on mount
  useEffect(() => { load() }, [load])

  return {
    trendingPapers,
    allPapers,
    bestTheses,
    isLoading,
    error,
    refresh: load,
  }
}