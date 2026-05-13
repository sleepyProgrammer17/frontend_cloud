// ─────────────────────────────────────────────────────────────────────────────
// BestThesesSidebar — sidebar card showing top-ranked theses
// Usage: import { BestThesesSidebar } from "@/components/research/BestThesesSidebar"
// ─────────────────────────────────────────────────────────────────────────────

import { Trophy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { getDeptTheme } from "./departmentThemes"
import { CoverPage } from "./CoverPage"
import type { Paper } from "./paper"
import type { BestThesisEntry } from "./papers"  // ← import the type

interface BestThesesSidebarProps {
  allPapers:   Paper[]
  bestTheses:  BestThesisEntry[]             // ← now a prop, not a static import
  onSelect:    (p: Paper) => void
}

export function BestThesesSidebar({ allPapers, bestTheses, onSelect }: BestThesesSidebarProps) {
  return (
    <Card className="border border-border shadow-sm">
      <CardContent className="p-4">
        <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-1.5">
          <Trophy className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          Best Theses of the Year
        </h2>

        <div className="flex flex-col gap-4">
          {bestTheses.map((thesis) => {
            const theme = getDeptTheme(thesis.department)
            const full  = allPapers.find((p) => p.title === thesis.title)

            return (
              <div
                key={thesis.rank}
                className="flex items-center gap-3 group cursor-pointer"
                onClick={() => full && onSelect(full)}
              >
                {/* Mini CoverPage */}
                <div className="flex-none rounded-md overflow-hidden shadow-sm" style={{ width: 44, height: 62 }}>
                  <CoverPage
                    title={thesis.title}
                    author={thesis.author}
                    department={thesis.department}
                    titleSize={6}
                  />
                </div>

                {/* Meta */}
                <div className="flex items-start gap-1.5 min-w-0 flex-1">
                  <span className="text-xs font-bold text-muted-foreground mt-0.5 w-3 flex-none">
                    {thesis.rank}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground leading-tight group-hover:underline transition-colors line-clamp-2 capitalize">
                      {thesis.title}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="w-2 h-2 rounded-full flex-none" style={{ backgroundColor: theme.bgColor }} />
                      <p className="text-[10px] text-muted-foreground">{theme.label}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground">by {thesis.author}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}