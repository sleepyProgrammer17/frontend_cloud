// ─────────────────────────────────────────────────────────────────────────────
// VerticalPaperRow — single row in the All Publications list
// Usage: import { VerticalPaperRow } from "@/components/research/VerticalPaperRow"
// ─────────────────────────────────────────────────────────────────────────────

import { getDeptTheme } from "./departmentThemes"
import { CoverPage } from "./CoverPage"
import type { Paper } from "./paper"

export function VerticalPaperRow({
  paper,
  onSelect,
}: {
  paper: Paper
  onSelect: (p: Paper) => void
}) {
  const theme = getDeptTheme(paper.department)

  return (
    <div
      className="flex gap-3 group cursor-pointer items-start py-3 border-b border-border last:border-0 hover:bg-muted/40 rounded-lg px-2 transition-colors"
      onClick={() => onSelect(paper)}
    >
      {/* Mini CoverPage thumbnail */}
      <div className="flex-none rounded-md overflow-hidden shadow-sm" style={{ width: 52, height: 74 }}>
        <CoverPage
          title={paper.title}
          author={paper.author}
          department={paper.department}
          titleSize={7}
        />
      </div>

      {/* Text details */}
      <div className="flex flex-col gap-1 min-w-0 flex-1 pt-0.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none"
            style={{
              backgroundColor: theme.bgColor + "18",
              color: theme.bgColor,
              border: `0.5px solid ${theme.bgColor}44`,
            }}
          >
            {theme.label}
          </span>
          <span className="text-[9px] text-muted-foreground">{paper.year}</span>
        </div>

        <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2 group-hover:underline transition-colors">
          {paper.title}
        </p>

        <p className="text-[10px] text-muted-foreground">
          by {paper.author} · {paper.universityName}
        </p>

        <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed hidden sm:block">
          {paper.abstract}
        </p>
      </div>
    </div>
  )
}