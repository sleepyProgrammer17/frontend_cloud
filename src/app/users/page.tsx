"use client"

import { useEffect, useCallback, useState, useRef } from "react"
import { BaseLayout } from "@/components/layouts/base-layout"
import { DataTable } from "./components/data-table"
import {
  useResearchSearch,
  useDeleteResearch,
} from "@/hooks/useResearch"
import { useCategoryList } from "@/hooks/useCategory"
import type { Paper } from "@/app/research_repository/components/paper"
import { mapResearchToPaper } from "../research_repository/components/mapResearchToPaper"
import { ResearchFormDialog } from "./components/user-form-dialog"
import type { FormValues } from "@/components/ReusableForm"

// ─── Mapper: Paper → FormValues ──────────────────────────────────────────────

function paperToFormValues(paper: Paper): FormValues {
  return {
    title:       paper.title      ?? "",
    keywords:    Array.isArray(paper.keywords)
                   ? paper.keywords.join(", ")
                   : (paper.keywords ?? ""),
    department:  paper.department ?? "",
    category:    paper.category   ?? "",
    year:        paper.year       ?? "",
    adviser:     paper.adviser    ?? "",
    authors:     Array.isArray(paper.author)
                   ? paper.author.join(", ")
                   : (paper.author ?? ""),
    abstract:    paper.abstract   ?? "",
    best_thesis: paper.bestThesis ?? false,
    file:        null,
  }
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ResearchRepositoryPage() {
  const {
    data: researchItems,
    total,
    pageSize,
    isLoading,
    search,
  } = useResearchSearch()

  const { remove, isLoading: isDeleting } = useDeleteResearch()
  const { data: categories, fetchAll: fetchCategories } = useCategoryList()

  // Raw input value — updates instantly so the input feels responsive
  const [searchInput, setSearchInput]       = useState("")
  // Debounced value — only updates 300ms after the user stops typing
  const [searchQuery, setSearchQuery]       = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [currentPage, setCurrentPage]       = useState(1)

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen]   = useState(false)
  const [editPaper, setEditPaper]             = useState<Paper | null>(null)
  const [editInitialData, setEditInitialData] = useState<FormValues | null>(null)

  // Create / view dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen]     = useState(false)
  const [viewPaper, setViewPaper]               = useState<Paper | null>(null)
  const [viewInitialData, setViewInitialData]   = useState<FormValues | null>(null)

  // ── Fetch helpers ─────────────────────────────────────────────────────────

  const runSearch = useCallback(
    (query: string, category: string, p: number) => {
      search({ query: query || undefined, category: category || undefined, page: p })
    },
    [search]
  )

  // Only fires when searchQuery (debounced), categoryFilter, or page changes
  useEffect(() => {
    runSearch(searchQuery, categoryFilter, currentPage)
  }, [searchQuery, categoryFilter, currentPage, runSearch])

  // Fetch categories once on mount for the filter dropdown
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const papers: Paper[] = (researchItems ?? []).map(mapResearchToPaper)

  const categoryOptions = (categories ?? []).map((c) => ({
    label: c.name,
    value: String(c.id), // backend filters by category__id
  }))

  // ── Handlers ─────────────────────────────────────────────────────────────

  // Called on every keystroke — updates the visible input instantly,
  // but waits 300ms of silence before committing to searchQuery (which triggers the API)

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value)

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)

    searchDebounceRef.current = setTimeout(() => {
      setSearchQuery(value)
      setCurrentPage(1)
    }, 300)
  }, [])

  const handleCategoryChange = useCallback((category: string) => {
    setCategoryFilter(category)
    setCurrentPage(1)
  }, [])

  const handleDeletePaper = useCallback(
    async (id: string) => {
      const result = await remove(id)
      if (result.ok) runSearch(searchQuery, categoryFilter, currentPage)
      else console.error("Delete failed:", result.error)
    },
    [remove, runSearch, searchQuery, categoryFilter, currentPage]
  )

  const handleEditPaper = useCallback((paper: Paper) => {
    setEditPaper(paper)
    setEditInitialData(paperToFormValues(paper))
    setEditDialogOpen(true)
  }, [])

  const handleViewPaper = useCallback((paper: Paper) => {
    setViewPaper(paper)
    setViewInitialData(paperToFormValues(paper))
    setViewDialogOpen(true)
  }, [])

  const handleEditSuccess = useCallback(() => {
    runSearch(searchQuery, categoryFilter, currentPage)
    setEditDialogOpen(false)
    setTimeout(() => { setEditPaper(null); setEditInitialData(null) }, 300)
  }, [runSearch, searchQuery, categoryFilter, currentPage])

  const handleEditOpenChange = useCallback((open: boolean) => {
    setEditDialogOpen(open)
    if (!open) setTimeout(() => { setEditPaper(null); setEditInitialData(null) }, 300)
  }, [])

  const handleViewOpenChange = useCallback((open: boolean) => {
    setViewDialogOpen(open)
    if (!open) setTimeout(() => { setViewPaper(null); setViewInitialData(null) }, 300)
  }, [])

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <BaseLayout
      title="Research Repository"
      description="Browse and manage research papers across all departments"
    >
      <div className="flex flex-col gap-4">

        <ResearchFormDialog
          mode="create"
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={() => {
            runSearch(searchQuery, categoryFilter, currentPage)
            setCreateDialogOpen(false)
          }}
        />

        {editPaper && editInitialData && (
          <ResearchFormDialog
            mode="update"
            paperId={editPaper.id}
            initialData={editInitialData}
            open={editDialogOpen}
            onOpenChange={handleEditOpenChange}
            onSuccess={handleEditSuccess}
          />
        )}

        {viewPaper && viewInitialData && (
          <ResearchFormDialog
            mode="view"
            paperId={viewPaper.id}
            initialData={viewInitialData}
            open={viewDialogOpen}
            onOpenChange={handleViewOpenChange}
          />
        )}

        <div className="@container/main px-4 lg:px-6">
          <DataTable
            papers={papers}
            isLoading={isLoading || isDeleting}
            total={total}
            page={currentPage}
            pageSize={pageSize}
            searchValue={searchInput}
            categoryOptions={categoryOptions}
            onDeletePaper={handleDeletePaper}
            onEditPaper={handleEditPaper}
            onViewPaper={handleViewPaper}
            onAddPaper={() => setCreateDialogOpen(true)}
            onSearchChange={handleSearchChange}
            onCategoryChange={handleCategoryChange}
            onPageChange={setCurrentPage}
          />
        </div>

      </div>
    </BaseLayout>
  )
}