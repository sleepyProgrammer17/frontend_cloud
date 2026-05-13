"use client"

import { useEffect, useCallback, useState, useRef } from "react"
import { BaseLayout } from "@/components/layouts/base-layout"
import { BorrowedBooksDataTable, type OverdueSettingOption } from "./borrowed-books-data-table"
import {
  useBorrowedBookList,
  useCreateBorrowedBook,
  useUpdateBorrowedBook,
  type BorrowedBookItem,
  type ReturnPayload,
  type BorrowPayload,
} from "@/hooks/use-borrow"
import api from "@/lib/api"

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function BorrowedBooksPage() {
  const { data, isLoading, fetchAll } = useBorrowedBookList()
  const { create }                    = useCreateBorrowedBook()
  const { update }                    = useUpdateBorrowedBook()

  const [searchInput,     setSearchInput]     = useState("")
  const [searchQuery,     setSearchQuery]     = useState("")
  const [statusFilter,    setStatusFilter]    = useState("")
  const [currentPage,     setCurrentPage]     = useState(1)
  const [updatingId,      setUpdatingId]      = useState<string | null>(null)
  const [overdueSettings, setOverdueSettings] = useState<OverdueSettingOption[]>([])

  const PAGE_SIZE         = 10
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Fetch all data ──────────────────────────────────────────────────────────

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Fetch overdue settings once on mount so the Borrow dialog can display them
  useEffect(() => {
    api
      .get<OverdueSettingOption[]>("/overdue-settings/")
      .then(({ data }) => setOverdueSettings(data))
      .catch(() => {/* non-critical — dialog still works without fee options */})
  }, [])

  // ── Client-side filter + paginate ───────────────────────────────────────────

  const allBooks: BorrowedBookItem[] = data ?? []

  const filtered = allBooks.filter((item) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      !q ||
      item.book_title.toLowerCase().includes(q) ||
      item.user.toLowerCase().includes(q) ||
      item.book_author.toLowerCase().includes(q)

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

  /**
   * Create a new borrow record.
   * BorrowPayload includes: copy, due_date, status, is_damaged, overdue_setting?, remarks?
   * perform_create on the backend flips the copy to "borrowed" and increments times_borrowed.
   */
  const handleBorrow = useCallback(
    async (payload: BorrowPayload) => {
      const result = await create(payload)
      if (result.ok) fetchAll()
    },
    [create, fetchAll]
  )

  /**
   * Process a return (good / damaged / lost).
   * perform_update on the backend syncs BookCopy.status via COPY_STATUS_MAP.
   */
  const handleReturn = useCallback(
    async (item: BorrowedBookItem, payload: ReturnPayload) => {
      setUpdatingId(item.id)
      const result = await update(item.id, payload)
      if (result.ok) fetchAll()
      setUpdatingId(null)
    },
    [update, fetchAll]
  )

  /**
   * Transition a pending record to borrowed (book physically handed over).
   * Collects due_date, is_damaged, and optional remarks from the dialog
   * so the record is never immediately overdue after approval.
   */
  const handleMarkBorrowed = useCallback(
    async (item: BorrowedBookItem, dueDate: string, isDamaged: boolean, remarks?: string) => {
      setUpdatingId(item.id)
      const result = await update(item.id, {
        status:     "borrowed",
        due_date:   dueDate,
        is_damaged: isDamaged,
        remarks,
      })
      if (result.ok) fetchAll()
      setUpdatingId(null)
    },
    [update, fetchAll]
  )

  /** Mark the overdue fee as paid. */
  const handleMarkPaid = useCallback(
    async (item: BorrowedBookItem) => {
      setUpdatingId(item.id)
      const result = await update(item.id, {
        is_paid: true,
        paid_at: new Date().toISOString(),
      })
      if (result.ok) fetchAll()
      setUpdatingId(null)
    },
    [update, fetchAll]
  )

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <BaseLayout
      title="Borrowed Books"
      description="Track and manage all borrowed physical books"
    >
      <div className="flex flex-col gap-4">
        <div className="@container/main px-4 lg:px-6">
          <BorrowedBooksDataTable
            borrowedBooks={paginatedRows}
            isLoading={isLoading}
            total={total}
            page={currentPage}
            pageSize={PAGE_SIZE}
            searchValue={searchInput}
            statusFilter={statusFilter}
            overdueSettings={overdueSettings}
            updatingId={updatingId}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
            onPageChange={setCurrentPage}
            onBorrow={handleBorrow}
            onReturn={handleReturn}
            onMarkBorrowed={handleMarkBorrowed}
            onMarkPaid={handleMarkPaid}
          />
        </div>
      </div>
    </BaseLayout>
  )
}