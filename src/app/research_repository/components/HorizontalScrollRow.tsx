// ─────────────────────────────────────────────────────────────────────────────
// HorizontalScrollRow + HorizontalPaperCard
// Usage: import { HorizontalScrollRow } from "@/components/research/HorizontalScrollRow"
// ─────────────────────────────────────────────────────────────────────────────

"use client"

import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getDeptTheme } from "./departmentThemes"
import { CoverPage } from "./CoverPage"
import type { Paper } from "./paper"

// ── HorizontalPaperCard ──────────────────────────────────────────────────────

function HorizontalPaperCard({
  paper,
  onSelect,
}: {
  paper: Paper
  onSelect: (p: Paper) => void
}) {
  const theme = getDeptTheme(paper.department)

  return (
    <div
      className="flex-none w-[clamp(90px,22vw,130px)] snap-start group cursor-pointer"
      onClick={() => onSelect(paper)}
    >
      <div
        className="relative overflow-hidden rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200"
        style={{ aspectRatio: "2/3" }}
      >
        <CoverPage
          title={paper.title}
          author={paper.author}
          department={paper.department}
          titleSize={8}
        />
        <div className="absolute top-1.5 left-1.5">
          <span
            className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full backdrop-blur-sm leading-none"
            style={{
              backgroundColor: theme.accentColor + "33",
              color: theme.accentColor,
              border: `0.5px solid ${theme.accentColor}66`,
            }}
          >
            {theme.label}
          </span>
        </div>
      </div>
      <p className="mt-1.5 text-[11px] font-semibold text-foreground leading-tight line-clamp-2 capitalize">{paper.title}</p>
      <p className="text-[10px] text-muted-foreground line-clamp-1">by {paper.author}</p>
    </div>
  )
}

// ── HorizontalScrollRow ──────────────────────────────────────────────────────

export function HorizontalScrollRow({
  papers,
  title,
  onSelect,
}: {
  papers: Paper[]
  title: string
  onSelect: (p: Paper) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return
    const w = scrollRef.current.querySelector<HTMLElement>(".snap-start")?.offsetWidth ?? 140
    scrollRef.current.scrollBy({ left: dir === "right" ? w + 12 : -(w + 12), behavior: "smooth" })
  }

  return (
    <section className="space-y-3 w-full min-w-0">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="text-xs text-muted-foreground font-medium hover:underline whitespace-nowrap">
            See All
          </button>
          <div className="flex gap-1">
            {(["left", "right"] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => scroll(dir)}
                className="rounded-full border border-border bg-primary p-1 shadow-sm hover:bg-muted transition-colors"
                aria-label={`Scroll ${dir}`}
              >
                {dir === "left"
                  ? <ChevronLeft  className="h-3 w-3 text-primary-foreground" />
                  : <ChevronRight className="h-3 w-3 text-primary-foreground" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
      >
        {papers.map((p) => (
          <HorizontalPaperCard key={p.id} paper={p} onSelect={onSelect} />
        ))}
      </div>
    </section>
  )
}