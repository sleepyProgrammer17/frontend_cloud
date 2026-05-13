// ─────────────────────────────────────────────────────────────────────────────
// Paper type — derived from the API ResearchItem shape
// ─────────────────────────────────────────────────────────────────────────────

export interface Paper {
  id: string                        // UUID from API
  title: string
  author: string                    // mapped from details.authors
  universityName: string            // static — Mabini Colleges
  department: string                // mapped from department_name
  year: number                      // mapped from details.year
  abstract: string                  // mapped from details.abstract
  keywords: string[]                // split from comma-separated keywords string
  adviser: string                   // mapped from details.adviser
  pages?: number                    // optional — not in API
  readUrl: string | null            // signed_file_url
  bestThesis?: boolean              // best_thesis flag
  category?: string | null          // category_name
  timesViewed?: number              // times_viewed
  uploadedBy?: string | null        // uploaded_by_username
}