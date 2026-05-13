"use client"

import { useState } from "react"
import {
  ArrowLeft, BookOpen, Calendar, Tag,
  Layers, Library, Eye, BookText,
} from "lucide-react"
import type { Resource } from "../components/resource"
import PDFViewerPanel from "@/components/pdf-viewer"

interface ResourceDetailPageProps {
  resource: Resource
  onBack: () => void
}

const COVER_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  default:    { bg: "#2c3e50", text: "#ffffff", accent: "#e67e22" },
  fiction:    { bg: "#6d3b8c", text: "#ffffff", accent: "#c39bd3" },
  science:    { bg: "#1a5276", text: "#ffffff", accent: "#5dade2" },
  history:    { bg: "#7b4a2d", text: "#ffffff", accent: "#f0b27a" },
  technology: { bg: "#1b4332", text: "#ffffff", accent: "#74c69d" },
  art:        { bg: "#922b21", text: "#ffffff", accent: "#f1948a" },
  philosophy: { bg: "#1f3a5f", text: "#ffffff", accent: "#aab7b8" },
}

function getCoverTheme(category_name?: string | null) {
  if (!category_name) return COVER_COLORS.default
  const key = category_name.toLowerCase()
  for (const [k, v] of Object.entries(COVER_COLORS)) {
    if (key.includes(k)) return v
  }
  const hash = [...category_name].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const options = Object.values(COVER_COLORS)
  return options[hash % options.length]
}

function ResourceCover({
  resource,
  theme,
}: {
  resource: Resource
  theme: ReturnType<typeof getCoverTheme>
}) {
  const [imgError, setImgError] = useState(false)

  if (resource.imageUrl && !imgError) {
    return (
      <img
        src={resource.imageUrl}
        alt={resource.title}
        onError={() => setImgError(true)}
        className="w-full h-full object-cover rounded-xl shadow-2xl"
      />
    )
  }

  return (
    <div
      className="w-full h-full rounded-xl shadow-2xl flex flex-col items-center justify-between p-5 select-none"
      style={{ backgroundColor: theme.bg }}
    >
      <div className="w-full flex flex-col gap-1">
        <div className="h-1 w-full rounded-full opacity-60" style={{ backgroundColor: theme.accent }} />
        <div className="h-0.5 w-2/3 rounded-full opacity-30" style={{ backgroundColor: theme.accent }} />
      </div>
      <div className="flex-1 flex items-center justify-center px-2 text-center">
        <p className="font-bold leading-snug text-sm" style={{ color: theme.text }}>
          {resource.title}
        </p>
      </div>
      <div className="w-full flex flex-col gap-1.5">
        <div className="h-px w-full opacity-20" style={{ backgroundColor: theme.accent }} />
        <p className="text-[9px] font-semibold opacity-70 uppercase tracking-widest" style={{ color: theme.text }}>
          {resource.author}
        </p>
        {resource.category_name && (
          <span
            className="self-start text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider"
            style={{ backgroundColor: theme.accent + "33", color: theme.accent }}
          >
            {resource.category_name}
          </span>
        )}
      </div>
    </div>
  )
}

export function ResourceDetailPage({ resource, onBack }: ResourceDetailPageProps) {
  const [showPDF, setShowPDF] = useState(false)

  const theme = getCoverTheme(resource.category_name)

  // ── PDF viewer overlay ──────────────────────────────────────────────────────
  if (showPDF && resource.readUrl) {
    return (
      <PDFViewerPanel
        digitalId={resource.id}
        src={resource.readUrl}
        title={resource.title}
        backLabel="Back to resource"
        onBack={() => setShowPDF(false)}
      />
    )
  }

  // ── Detail view ─────────────────────────────────────────────────────────────
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
        {resource.category_name && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: theme.bg + "18",
              color: theme.bg,
              border: `0.5px solid ${theme.bg}44`,
            }}
          >
            {resource.category_name}
          </span>
        )}
        <p className="text-xs text-muted-foreground line-clamp-1 flex-1">{resource.title}</p>
      </div>

      {/* ── Main content ── */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-10 max-w-5xl mx-auto">

          {/* ── Left: Details ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">

            {/* Title block */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {resource.category_name && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: theme.bg, color: theme.text }}
                  >
                    {resource.category_name}
                  </span>
                )}
                {resource.year > 0 && (
                  <span className="text-xs text-muted-foreground">{resource.year}</span>
                )}
                {resource.type && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                    {resource.type}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
                {resource.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                by <span className="font-medium text-foreground">{resource.author}</span>
              </p>
            </div>

            {/* Accent divider */}
            <div className="h-0.5 w-16 rounded-full" style={{ backgroundColor: theme.accent }} />

            {/* Meta grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                resource.publisher           && { icon: <Library  className="h-3.5 w-3.5" />, label: "Publisher", value: resource.publisher },
                resource.year > 0            && { icon: <Calendar className="h-3.5 w-3.5" />, label: "Year",      value: String(resource.year) },
                resource.type                && { icon: <Tag      className="h-3.5 w-3.5" />, label: "Type",      value: resource.type },
                resource.timesViewed != null && { icon: <Eye      className="h-3.5 w-3.5" />, label: "Views",     value: `${resource.timesViewed}×` },
              ]
                .filter(Boolean)
                .map((item) => {
                  const { icon, label, value } = item as { icon: React.ReactNode; label: string; value: string }
                  return (
                    <div key={label} className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-1 text-muted-foreground min-w-0">
                        <span className="shrink-0">{icon}</span>
                        <span className="text-[10px] uppercase tracking-wider font-semibold truncate">{label}</span>
                      </div>
                      <p className="text-xs font-medium text-foreground break-words">{value}</p>
                    </div>
                  )
                })}
            </div>

            {/* Abstract */}
            {resource.abstract && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span className="text-[10px] uppercase tracking-wider font-semibold">Abstract</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed text-justify indent-4 sm:indent-8 break-words hyphens-auto">
                  {resource.abstract}
                </p>
              </div>
            )}

            {/* Keywords */}
            {resource.keywords && resource.keywords.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Layers className="h-3.5 w-3.5" />
                  <span className="text-[10px] uppercase tracking-wider font-semibold">Keywords</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {resource.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="text-[10px] font-medium px-2 py-0.5 rounded-full border lowercase"
                      style={{
                        borderColor: theme.bg + "44",
                        color: theme.bg,
                        backgroundColor: theme.bg + "0d",
                      }}
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Read button — now opens PDFViewerPanel instead of a plain anchor tag */}
            <div className="mt-2">
              {resource.readUrl ? (
                <button
                  onClick={() => setShowPDF(true)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: theme.bg, color: theme.text }}
                >
                  <BookText className="h-4 w-4" />
                  Read Now
                </button>
              ) : (
                <button
                  disabled
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold opacity-40 cursor-not-allowed"
                  style={{ backgroundColor: theme.bg, color: theme.text }}
                >
                  <BookText className="h-4 w-4" />
                  Not Available
                </button>
              )}
            </div>

          </div>

          {/* ── Right: Cover ── */}
          <div className="flex flex-col items-center gap-4 lg:w-56 flex-shrink-0">
            <div className="w-48 sm:w-52" style={{ aspectRatio: "2/3" }}>
              <ResourceCover resource={resource} theme={theme} />
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Resource Cover</p>
          </div>

        </div>
      </div>
    </div>
  )
}