"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import { BookOpen, Search, X, ChevronDown, LayoutList } from "lucide-react"

import { usePapers } from "./papers"
import { HorizontalScrollRow } from "./HorizontalScrollRow"
import { VerticalPaperRow } from "./VerticalPaperRow"
import { BestThesesSidebar } from "./BestThesesSidebar"
import { PaperDetailPage } from "./PaperDetailPage"
import type { Paper } from "./paper"

import { useCategoryList } from "@/hooks/useCategory"
import { useResearchSearch } from "@/hooks/useResearch"

export function ResearchPage({ className, ...props }: React.ComponentProps<"div">) {
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null)

  const { trendingPapers, allPapers, bestTheses, isLoading, error } = usePapers()
  const { data: categories, fetchAll: fetchCategories } = useCategoryList()
  const {
    data: searchResults,
    total: searchTotal,
    isLoading: isSearching,
    error: searchError,
    search,
  } = useResearchSearch()

  const [query, setQuery]                   = useState("")
  const [submittedQuery, setSubmittedQuery] = useState("")
  const [selectedCategory, setSelected]     = useState<string>("")
  const [categoryOpen, setCategoryOpen]     = useState(false)
  const [hasSearched, setHasSearched]       = useState(false)
  const [activeLetter, setActiveLetter]     = useState<string>("")
  const dropdownRef                         = useRef<HTMLDivElement>(null)

  useEffect(() => { fetchCategories() }, [fetchCategories])

  // close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCategoryOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // ── helpers ──────────────────────────────────────────────────────────────
  const selectedCategoryLabel =
    categories?.find((c) => String(c.id) === selectedCategory)?.name ?? "All Categories"

  const isSearchFilterActive = submittedQuery.trim() !== "" || selectedCategory !== ""
  const isFilterActive       = isSearchFilterActive || activeLetter !== ""

  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

  const lettersInAll = new Set(
    allPapers.map((p) => p.title.trim().toUpperCase()[0]).filter(Boolean)
  )

  const lettersInSearch = new Set(
    (searchResults ?? []).map((item) => item.title.trim().toUpperCase()[0]).filter(Boolean)
  )

  const filteredByLetter = activeLetter
    ? allPapers.filter((p) => p.title.trim().toUpperCase().startsWith(activeLetter))
    : allPapers

  const filteredSearchByLetter = activeLetter && searchResults
    ? searchResults.filter((item) => item.title.trim().toUpperCase().startsWith(activeLetter))
    : searchResults

  // ── handlers ─────────────────────────────────────────────────────────────

  const handleSearch = useCallback(() => {
    const isActive = query.trim() !== "" || selectedCategory !== ""
    if (!isActive) return
    setSubmittedQuery(query)
    setHasSearched(true)
    search({ query: query.trim() || undefined, category: selectedCategory || undefined, page: 1 })
  }, [query, selectedCategory, search])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch()
  }

  function clearAll() {
    setQuery("")
    setSubmittedQuery("")
    setSelected("")
    setHasSearched(false)
    setActiveLetter("")
  }

  // ── early return: detail page ─────────────────────────────────────────────
  if (selectedPaper) {
    return <PaperDetailPage paper={selectedPaper} onBack={() => setSelectedPaper(null)} />
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className={cn("w-full min-h-screen bg-background text-foreground", className)} {...props}>
      <div className="px-4 sm:px-6 lg:px-8 pb-8">

        {/* ── Search & Category bar ─────────────────────────────────────── */}
        <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-sm py-3 mb-4 border-b border-border">
          <div className="flex items-center gap-2">

            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search research… (press Enter)"
                className={cn(
                  "w-full h-8 pl-8 pr-3 rounded-md border border-input bg-background",
                  "text-sm placeholder:text-muted-foreground",
                  "focus:outline-none focus:ring-1 focus:ring-ring transition-colors",
                )}
              />
            </div>

            {/* Category dropdown */}
            <div className="relative flex-shrink-0" ref={dropdownRef}>
              <button
                onClick={() => setCategoryOpen((o) => !o)}
                title={selectedCategoryLabel}
                className={cn(
                  "flex items-center justify-center gap-1.5 h-8 rounded-md border border-input bg-background",
                  "text-sm whitespace-nowrap hover:bg-accent transition-colors",
                  "w-8 sm:w-auto sm:px-3",
                  selectedCategory && "border-primary text-primary",
                )}
              >
                <LayoutList className={cn(
                  "h-3.5 w-3.5 flex-shrink-0 sm:hidden",
                  selectedCategory ? "text-primary" : "text-muted-foreground",
                )} />
                <span className="hidden sm:inline max-w-[120px] truncate">{selectedCategoryLabel}</span>
                <ChevronDown className={cn(
                  "hidden sm:inline h-3.5 w-3.5 flex-shrink-0 text-muted-foreground transition-transform",
                  categoryOpen && "rotate-180",
                )} />
              </button>

              {categoryOpen && (
                <div className="absolute right-0 mt-1 w-48 rounded-md border border-border bg-popover shadow-lg z-30 py-1 max-h-60 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelected("")
                      setCategoryOpen(false)
                      setHasSearched(false)
                      setSubmittedQuery("")
                    }}
                    className={cn(
                      "w-full text-left px-3 py-1.5 text-sm hover:bg-accent transition-colors",
                      selectedCategory === "" && "font-semibold text-primary",
                    )}
                  >
                    All Categories
                  </button>
                  {categories?.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        const id = String(cat.id)
                        setSelected(id)
                        setCategoryOpen(false)
                        setHasSearched(true)
                        search({ query: submittedQuery.trim() || undefined, category: id, page: 1 })
                      }}
                      className={cn(
                        "w-full text-left px-3 py-1.5 text-sm hover:bg-accent transition-colors",
                        selectedCategory === String(cat.id) && "font-semibold text-primary",
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Clear button */}
            {isFilterActive && (
              <button
                onClick={clearAll}
                title="Clear filters"
                className="flex items-center justify-center h-8 w-8 rounded-md border border-input hover:bg-accent transition-colors flex-shrink-0"
              >
                <X className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {/* ── Skeleton ─────────────────────────────────────────────────── */}
        {isLoading && (
          <div className="flex flex-col lg:flex-row gap-6 w-full min-w-0">
            <div className="flex flex-col gap-5 flex-1 min-w-0">
              <div className="flex gap-3 overflow-hidden">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-48 h-28 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
              <div className="flex flex-col gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex gap-3 items-start py-2">
                    <div className="w-10 h-10 rounded-md bg-muted animate-pulse flex-shrink-0" />
                    <div className="flex flex-col gap-1.5 flex-1">
                      <div className="h-3.5 w-3/4 rounded bg-muted animate-pulse" />
                      <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                      <div className="h-3 w-1/4 rounded bg-muted animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 w-full lg:w-[260px] xl:w-[280px] flex-shrink-0">
              <div className="h-4 w-32 rounded bg-muted animate-pulse" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="w-8 h-8 rounded bg-muted animate-pulse flex-shrink-0" />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <div className="h-3 w-full rounded bg-muted animate-pulse" />
                    <div className="h-3 w-2/3 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-20 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            SEARCH / FILTER MODE
        ══════════════════════════════════════════════════════════════════ */}
        {!isLoading && !error && isSearchFilterActive && (
          <div className="flex flex-col gap-2">

            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                {isSearching
                  ? "Searching…"
                  : activeLetter
                  ? `Results starting with "${activeLetter}"`
                  : "Search Results"}
              </h2>
              {!isSearching && hasSearched && (
                <span className="text-xs text-muted-foreground">
                  {activeLetter
                    ? (filteredSearchByLetter?.length ?? 0)
                    : searchTotal}{" "}
                  paper{searchTotal !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="flex gap-2">

              {/* A–Z vertical strip */}
              <div className="flex flex-col items-center gap-px flex-shrink-0 sticky top-16 self-start py-1">
                {activeLetter && (
                  <button
                    onClick={() => setActiveLetter("")}
                    title="Clear letter"
                    className="mb-1 flex items-center justify-center w-5 h-5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
                {LETTERS.map((letter) => {
                  const hasItems = lettersInSearch.has(letter)
                  return (
                    <button
                      key={letter}
                      disabled={!hasItems}
                      onClick={() => setActiveLetter((prev) => (prev === letter ? "" : letter))}
                      title={letter}
                      className={cn(
                        "w-5 h-5 rounded text-[10px] font-bold leading-none transition-colors flex items-center justify-center",
                        activeLetter === letter
                          ? "bg-primary text-primary-foreground"
                          : hasItems
                          ? "hover:bg-accent text-foreground"
                          : "text-muted-foreground/25 cursor-not-allowed",
                      )}
                    >
                      {letter}
                    </button>
                  )
                })}
              </div>

              {/* Results list */}
              <div className="flex flex-col flex-1 min-w-0">
                {isSearching && (
                  <div className="flex flex-col gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex gap-3 items-start py-2">
                        <div className="w-10 h-10 rounded-md bg-muted animate-pulse flex-shrink-0" />
                        <div className="flex flex-col gap-1.5 flex-1">
                          <div className="h-3.5 w-3/4 rounded bg-muted animate-pulse" />
                          <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                          <div className="h-3 w-1/4 rounded bg-muted animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {searchError && (
                  <div className="py-10 text-center text-sm text-destructive">{searchError}</div>
                )}
                {!isSearching && hasSearched && searchResults && searchResults.length === 0 && (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    No results found. Try a different query or category.
                  </div>
                )}
                {!isSearching && filteredSearchByLetter && filteredSearchByLetter.length > 0 && (
                  <div className="flex flex-col">
                    {filteredSearchByLetter.map((item) => {
                      const details = (item.details ?? {}) as Record<string, unknown>
                      const paper: Paper = {
                        id:             String(item.id),
                        title:          item.title,
                        author:         String(details.authors ?? details.author ?? ""),
                        universityName: "Mabini Colleges",
                        department:     item.department_name ?? "",
                        year:           Number(details.year ?? 0),
                        abstract:       String(details.abstract ?? ""),
                        keywords:       item.keywords
                                          ? item.keywords.split(",").map((k) => k.trim()).filter(Boolean)
                                          : [],
                        adviser:        String(details.adviser ?? ""),
                        pages:          details.pages != null ? Number(details.pages) : undefined,
                        readUrl:        item.signed_file_url ?? item.file_path ?? null,
                        bestThesis:     Boolean(details.best_thesis ?? false),
                        category:       item.category_name ?? null,
                        timesViewed:    item.times_viewed,
                        uploadedBy:     item.uploaded_by_username ?? null,
                      }
                      return <VerticalPaperRow key={item.id} paper={paper} onSelect={setSelectedPaper} />
                    })}
                  </div>
                )}
                {!isSearching && activeLetter && filteredSearchByLetter?.length === 0 && searchResults && searchResults.length > 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No results starting with &ldquo;{activeLetter}&rdquo;.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            DEFAULT MODE
        ══════════════════════════════════════════════════════════════════ */}
        {!isLoading && !error && !isSearchFilterActive && (
          <div className="flex flex-col lg:flex-row gap-6 w-full min-w-0">

            <div className="flex flex-col gap-5 flex-1 min-w-0">
              <HorizontalScrollRow
                papers={trendingPapers}
                title="Trending Research"
                onSelect={setSelectedPaper}
              />

              <section>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    {activeLetter ? `Titles starting with "${activeLetter}"` : "All Publications"}
                  </h2>
                  <span className="text-xs text-muted-foreground">{filteredByLetter.length} papers</span>
                </div>

                <div className="flex gap-2">

                  {/* A–Z vertical strip */}
                  <div className="flex flex-col items-center gap-px flex-shrink-0 sticky top-16 self-start py-1">
                    {activeLetter && (
                      <button
                        onClick={() => setActiveLetter("")}
                        title="Clear"
                        className="mb-1 flex items-center justify-center w-5 h-5 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                    {LETTERS.map((letter) => {
                      const hasItems = lettersInAll.has(letter)
                      return (
                        <button
                          key={letter}
                          disabled={!hasItems}
                          onClick={() => setActiveLetter((prev) => (prev === letter ? "" : letter))}
                          title={letter}
                          className={cn(
                            "w-5 h-5 rounded text-[10px] font-bold leading-none transition-colors flex items-center justify-center",
                            activeLetter === letter
                              ? "bg-primary text-primary-foreground"
                              : hasItems
                              ? "hover:bg-accent text-foreground"
                              : "text-muted-foreground/25 cursor-not-allowed",
                          )}
                        >
                          {letter}
                        </button>
                      )
                    })}
                  </div>

                  {/* Paper list */}
                  <div className="flex flex-col flex-1 min-w-0">
                    {filteredByLetter.length === 0 ? (
                      <p className="py-8 text-center text-sm text-muted-foreground">
                        No papers starting with &ldquo;{activeLetter}&rdquo;.
                      </p>
                    ) : (
                      filteredByLetter.map((paper) => (
                        <VerticalPaperRow key={paper.id} paper={paper} onSelect={setSelectedPaper} />
                      ))
                    )}
                  </div>

                </div>
              </section>
            </div>

            <div className="flex flex-col gap-4 w-full lg:w-[260px] xl:w-[280px] flex-shrink-0">
              <BestThesesSidebar
                allPapers={[...trendingPapers, ...allPapers]}
                bestTheses={bestTheses}
                onSelect={setSelectedPaper}
              />
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

export default ResearchPage