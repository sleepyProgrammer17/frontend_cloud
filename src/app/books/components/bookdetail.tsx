"use client"

import { useState } from "react"
import {
  ArrowLeft, BookOpen, Calendar, Hash, Tag, Barcode,
  Layers, BookCopy, Library, 
} from "lucide-react"
import type { Book } from "../types/book"

interface BookDetailPageProps {
  book: Book
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
  // deterministic color from category string
  const hash = [...category_name].reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const options = Object.values(COVER_COLORS)
  return options[hash % options.length]
}

function BookCover({ book, theme }: { book: Book; theme: ReturnType<typeof getCoverTheme> }) {
  const [imgError, setImgError] = useState(false)

  if (book.imageUrl && !imgError) {
    return (
      <img
        src={book.imageUrl}
        alt={book.title}
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
      {/* top accent bar */}
      <div className="w-full flex flex-col gap-1">
        <div className="h-1 w-full rounded-full opacity-60" style={{ backgroundColor: theme.accent }} />
        <div className="h-0.5 w-2/3 rounded-full opacity-30" style={{ backgroundColor: theme.accent }} />
      </div>

      {/* title */}
      <div className="flex-1 flex items-center justify-center px-2 text-center">
        <p
          className="font-bold leading-snug text-sm"
          style={{ color: theme.text }}
        >
          {book.title}
        </p>
      </div>

      {/* author + category footer */}
      <div className="w-full flex flex-col gap-1.5">
        <div className="h-px w-full opacity-20" style={{ backgroundColor: theme.accent }} />
        <p className="text-[9px] font-semibold opacity-70 uppercase tracking-widest" style={{ color: theme.text }}>
          {book.author}
        </p>
        {book.category_name && (
          <span
            className="self-start text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider"
            style={{ backgroundColor: theme.accent + "33", color: theme.accent }}
          >
            {book.category_name}
          </span>
        )}
      </div>
    </div>
  )
}

export function BookDetailPage({ book, onBack }: BookDetailPageProps) {
  const theme = getCoverTheme(book.category_name)

  const availability = book.copies_available ?? 0
  const total = book.copies_total ?? 0
  const availabilityPct = total > 0 ? (availability / total) * 100 : 0
  const availabilityColor =
    availabilityPct === 0 ? "#e74c3c" :
    availabilityPct < 50  ? "#e67e22" : "#27ae60"

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
        {book.category_name && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: theme.bg + "18",
              color: theme.bg,
              border: `0.5px solid ${theme.bg}44`,
            }}
          >
            {book.category_name}
          </span>
        )}
        <p className="text-xs text-muted-foreground line-clamp-1 flex-1">{book.title}</p>
      </div>

      {/* ── Main content ── */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-10 max-w-5xl mx-auto">

          {/* ── Left: Details ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">

            {/* Title block */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                {book.category_name && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: theme.bg, color: theme.text }}
                  >
                    {book.category_name}
                  </span>
                )}
                {book.year > 0 && (
                  <span className="text-xs text-muted-foreground">{book.year}</span>
                )}
                {book.type && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                    {book.type}
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
                {book.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                by <span className="font-medium text-foreground">{book.author}</span>
              </p>
            </div>

            {/* Accent divider */}
            <div className="h-0.5 w-16 rounded-full" style={{ backgroundColor: theme.accent }} />

            {/* Meta grid */}
       <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
  {[
    book.publisher  && { icon: <Library   className="h-3.5 w-3.5" />, label: "Publisher",   value: book.publisher },
    book.year > 0   && { icon: <Calendar  className="h-3.5 w-3.5" />, label: "Year",        value: String(book.year) },
    book.isbn       && { icon: <Barcode    className="h-3.5 w-3.5" />, label: "ISBN",        value: book.isbn },
    book.type       && { icon: <Tag        className="h-3.5 w-3.5" />, label: "Type",        value: book.type },
                   { icon: <BookCopy    className="h-3.5 w-3.5" />, label: "Copies",      value: `${availability} / ${total} available` },
    book.timesBorrowed != null && { icon: <Hash className="h-3.5 w-3.5" />, label: "Borrowed",    value: `${book.timesBorrowed}×` },
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

            {/* Availability bar */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Availability
                </span>
                <span className="text-[10px] font-semibold" style={{ color: availabilityColor }}>
                  {availability === 0 ? "Unavailable" : `${availability} copy${availability !== 1 ? "ies" : ""} left`}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${availabilityPct}%`, backgroundColor: availabilityColor }}
                />
              </div>
            </div>

            {/* summary */}
           {book.summary && (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <BookOpen className="h-3.5 w-3.5" />
      <span className="text-[10px] uppercase tracking-wider font-semibold">summary</span>
    </div>
    <p className="text-sm text-foreground leading-relaxed text-justify indent-4 sm:indent-8 break-words hyphens-auto">
      {book.summary}
    </p>
  </div>
)}

            {/* Keywords */}
            {book.keywords && book.keywords.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Layers className="h-3.5 w-3.5" />
                  <span className="text-[10px] uppercase tracking-wider font-semibold">Keywords</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {book.keywords.map((kw) => (
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



          </div>

          {/* ── Right: Cover ── */}
          <div className="flex flex-col items-center gap-4 lg:w-56 flex-shrink-0">
            <div className="w-48 sm:w-52" style={{ aspectRatio: "2/3" }}>
              <BookCover book={book} theme={theme} />
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Book Cover</p>
          </div>

        </div>
      </div>
    </div>
  )
}