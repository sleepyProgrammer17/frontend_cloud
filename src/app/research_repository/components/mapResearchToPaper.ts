// ─────────────────────────────────────────────────────────────────────────────
// mapResearchToPaper.ts
// Converts a raw API ResearchItem into the Paper shape used by UI components.
// ─────────────────────────────────────────────────────────────────────────────

import type { ResearchItem } from "@/hooks/useResearch"
import type { Paper } from "./paper"

// The API stores extra fields inside a flexible `details` JSON column.
interface ResearchDetails {
  adviser?:  string
  authors?:  string
  abstract?: string
  year?:     number | string
  [key: string]: unknown
}

export function mapResearchToPaper(item: ResearchItem): Paper {
  const details = (item.details ?? {}) as ResearchDetails

  return {
    id:            item.id as unknown as string,   // UUID
    title:         item.title,
    author:        details.authors  ?? item.uploaded_by_username ?? "Unknown Author",
    universityName: "Mabini Colleges",
    department:    item.department_name ?? "Unknown Department",
    year:          Number(details.year  ?? new Date(item.created_at).getFullYear()),
    abstract:      details.abstract ?? "",
    keywords:      item.keywords
                     ? item.keywords.split(",").map((k) => k.trim()).filter(Boolean)
                     : [],
    adviser:       details.adviser ?? "",
    readUrl:       item.signed_file_url,
    bestThesis:    (item as ResearchItem & { best_thesis?: boolean }).best_thesis ?? false,
    category:      item.category_name,
    timesViewed:   item.times_viewed,
    uploadedBy:    item.uploaded_by_username,
  }
}