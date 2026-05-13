"use client"

import { useEffect, useCallback, useState, useRef } from "react"
import { BaseLayout } from "@/components/layouts/base-layout"
import { BookSuggestionsDataTable } from "./book-suggestions-data-table"
import {
  useBookSuggestionList,
  useCreateBookSuggestion,
  useUpdateBookSuggestion,
  useDeleteBookSuggestion,
  type BookSuggestionItem,
  type SuggestionPayload,
  type SuggestionUpdateData,
} from "@/hooks/useBookSuggestion"

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function BookSuggestionsPage() {
  const { data, isLoading, fetchAll } = useBookSuggestionList()
  const { create }                    = useCreateBookSuggestion()
  const { update }                    = useUpdateBookSuggestion()
  const { remove }                    = useDeleteBookSuggestion()

  const [searchInput,  setSearchInput]  = useState("")
  const [searchQuery,  setSearchQuery]  = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage,  setCurrentPage]  = useState(1)
  const [updatingId,   setUpdatingId]   = useState<string | null>(null)

  const PAGE_SIZE         = 10
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Fetch ───────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // ── Client-side filter + paginate ───────────────────────────────────────────

  const allSuggestions: BookSuggestionItem[] = data ?? []

  const filtered = allSuggestions.filter((item) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.author.toLowerCase().includes(q) ||
      item.requested_by_username.toLowerCase().includes(q)

    const matchesStatus = !statusFilter || item.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const total         = filtered.length
  const paginatedRows = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value)
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current)
    searchDebounceRef.current = setTimeout(() => {
      setSearchQuery(value)
      setCurrentPage(1)
    }, 300)
  }, [])

  const handleStatusChange = useCallback((status: string) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }, [])

  const handleCreate = useCallback(
    async (payload: SuggestionPayload) => {
      const result = await create(payload)
      if (result.ok) fetchAll()
    },
    [create, fetchAll]
  )

  const handleUpdate = useCallback(
    async (id: string, payload: SuggestionUpdateData) => {
      setUpdatingId(id)
      const result = await update(id, payload)
      if (result.ok) fetchAll()
      setUpdatingId(null)
    },
    [update, fetchAll]
  )

  const handleDelete = useCallback(
    async (id: string) => {
      setUpdatingId(id)
      const result = await remove(id)
      if (result.ok) fetchAll()
      setUpdatingId(null)
    },
    [remove, fetchAll]
  )

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <BaseLayout
      title="Book Suggestions"
      description="Review and manage book suggestions from library members"
    >
      <div className="flex flex-col gap-4">
        <div className="@container/main px-4 lg:px-6">
          <BookSuggestionsDataTable
            suggestions={paginatedRows}
            isLoading={isLoading}
            total={total}
            page={currentPage}
            pageSize={PAGE_SIZE}
            searchValue={searchInput}
            statusFilter={statusFilter}
            updatingId={updatingId}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
            onPageChange={setCurrentPage}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </BaseLayout>
  )
}