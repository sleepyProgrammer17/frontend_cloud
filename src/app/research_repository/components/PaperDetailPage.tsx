// ─────────────────────────────────────────────────────────────────────────────
// PaperDetailPage — full detail view opened when a paper is clicked
// Usage: import { PaperDetailPage } from "@/components/research/PaperDetailPage"
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react"
import { ArrowLeft, BookMarked, Calendar, Quote, Hash, Building2, BookOpen, BookText } from "lucide-react"
import { getDeptTheme } from "./departmentThemes"
import { CoverPage } from "./CoverPage"
import PDFViewerPanel from "@/components/pdf-viewer"
import type { Paper } from "./paper"

interface PaperDetailPageProps {
  paper: Paper
  onBack: () => void
}

export function PaperDetailPage({ paper, onBack }: PaperDetailPageProps) {
  const [showPDF, setShowPDF] = useState(false)

  const theme = getDeptTheme(paper.department)
  const accentSafe = theme.accentColor === "#fffaea" ? theme.bgColor : theme.accentColor

  // ── PDF viewer overlay ─────────────────────────────────────────────────────
  if (showPDF && paper.readUrl) {
    return (
      <PDFViewerPanel
        researchId={paper.id}
        src={paper.readUrl}
        title={paper.title}
        backLabel="Back to paper"
        onBack={() => setShowPDF(false)}
      />
    )
  }

  // ── Detail view ────────────────────────────────────────────────────────────
  return (
    <div className="w-full min-h-screen bg-background text-foreground animate-in fade-in duration-200">

      {/* ── Sticky top nav ── */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <span className="text-muted-foreground/40">·</span>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: theme.bgColor + "18", color: theme.bgColor, border: `0.5px solid ${theme.bgColor}44` }}
        >
          {theme.label}
        </span>
        <p className="text-xs text-muted-foreground line-clamp-1 flex-1">{paper.title}</p>
      </div>

      {/* ── Main content ── */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-10 max-w-5xl mx-auto">

          {/* Left: Details */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">

            {/* Title block */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: theme.bgColor, color: theme.textColor }}
                >
                  {theme.label}
                </span>
                <span className="text-xs text-muted-foreground">{paper.year}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-snug capitalize">{paper.title}</h1>
              <p className="text-sm text-muted-foreground">
                by <span className="font-medium text-foreground capitalize">{paper.author}</span>
              </p>
            </div>

            {/* Accent divider */}
            <div className="h-0.5 w-16 rounded-full" style={{ backgroundColor: accentSafe }} />

            {/* Meta grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: <Building2  className="h-3.5 w-3.5" />, label: "Institution", value: paper.universityName },
                { icon: <BookMarked className="h-3.5 w-3.5" />, label: "Department",  value: paper.department },
                { icon: <Calendar   className="h-3.5 w-3.5" />, label: "Year",        value: String(paper.year) },
                { icon: <Hash       className="h-3.5 w-3.5" />, label: "Views",       value: paper.timesViewed ? `${paper.timesViewed} views` : "—" },
                { icon: <BookOpen   className="h-3.5 w-3.5" />, label: "Adviser",     value: paper.adviser ?? "—" },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    {icon}
                    <span className="text-[10px] uppercase tracking-wider font-semibold">{label}</span>
                  </div>
                  <p className="text-xs font-medium text-foreground">{value}</p>
                </div>
              ))}
            </div>

            {/* Abstract */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Quote className="h-3.5 w-3.5" />
                <span className="text-[10px] uppercase tracking-wider font-semibold">Abstract</span>
              </div>
              <p className="text-sm text-foreground leading-relaxed capitalize text-justify indent-8">{paper.abstract}</p>
            </div>

            {/* Keywords */}
            {paper.keywords && paper.keywords.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Keywords</span>
                <div className="flex flex-wrap gap-1.5">
                  {paper.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full border lowercase"
                      style={{ borderColor: theme.bgColor + "44", color: theme.bgColor, backgroundColor: theme.bgColor + "0d" }}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Read button */}
            <div className="mt-2">
              {paper.readUrl ? (
                <button
                  onClick={() => setShowPDF(true)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: theme.bgColor, color: theme.textColor }}
                >
                  <BookText className="h-4 w-4" />
                  Read Full Paper
                </button>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold opacity-40 cursor-not-allowed"
                  style={{ backgroundColor: theme.bgColor, color: theme.textColor }}
                >
                  <BookText className="h-4 w-4" />
                  Not Available
                </button>
              )}
            </div>
          </div>

          {/* Right: Cover Page */}
          <div className="flex flex-col items-center gap-4 lg:w-56 flex-shrink-0">
            <div className="w-48 sm:w-52" style={{ aspectRatio: "2/3" }}>
              <CoverPage
                title={paper.title}
                author={paper.author}
                department={paper.department}
                footerLines={[paper.department, String(paper.year)]}
                titleSize={12}
                className="shadow-xl rounded-lg"
              />
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Cover Page</p>
          </div>

        </div>
      </div>
    </div>
  )
}