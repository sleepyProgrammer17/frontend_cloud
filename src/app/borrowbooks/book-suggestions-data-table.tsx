"use client"

import { useState } from "react"
import {
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronDown,
  EllipsisVertical,
  Search,
  BookOpenCheck,
  BookPlus,
  Loader2,
  CheckCircle2,
  XCircle,
  Undo2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { BookSuggestionItem, SuggestionPayload, SuggestionUpdateData } from "@/hooks/useBookSuggestion"
import { useAuth } from "@/hooks/use-auth"

// ─── Types ──────────────────────────────────────────────────────────────────────

interface DataTableProps {
  suggestions?: BookSuggestionItem[]
  isLoading?: boolean
  total?: number
  page?: number
  pageSize?: number
  searchValue?: string
  statusFilter?: string
  onSearchChange?: (query: string) => void
  onStatusChange?: (status: string) => void
  onPageChange?: (page: number) => void
  onCreate?: (payload: SuggestionPayload) => Promise<void>
  onUpdate?: (id: string, payload: SuggestionUpdateData) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  updatingId?: string | null
}

// ─── Status Badge ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending:  { label: "Pending",  variant: "outline"     },
    approved: { label: "Approved", variant: "default"     },
    rejected: { label: "Rejected", variant: "destructive" },
  }
  const entry = map[status] ?? { label: status, variant: "outline" as const }
  return (
    <Badge variant={entry.variant} className="capitalize text-xs">
      {entry.label}
    </Badge>
  )
}

// ─── Create Dialog ──────────────────────────────────────────────────────────────

function CreateSuggestionDialog({
  open,
  isSubmitting,
  onClose,
  onConfirm,
}: {
  open: boolean
  isSubmitting: boolean
  onClose: () => void
  onConfirm: (payload: SuggestionPayload) => void
}) {
  const [title,  setTitle]  = useState("")
  const [author, setAuthor] = useState("")

  const handleConfirm = () => {
    if (!title.trim() || !author.trim()) return
    onConfirm({ title: title.trim(), author: author.trim() })
  }

  const handleClose = () => {
    setTitle("")
    setAuthor("")
    onClose()
  }

  const isValid = title.trim() !== "" && author.trim() !== ""

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookPlus className="size-4 text-primary" />
            Suggest a Book
          </DialogTitle>
          <DialogDescription>
            Submit a book you'd like added to the library collection.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="suggestion-title" className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="suggestion-title"
              placeholder="Book title…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="suggestion-author" className="text-sm font-medium">
              Author <span className="text-destructive">*</span>
            </Label>
            <Input
              id="suggestion-author"
              placeholder="Author name…"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting || !isValid} className="gap-2">
            {isSubmitting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <BookPlus className="size-3.5" />
            )}
            Submit Suggestion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Edit Dialog ────────────────────────────────────────────────────────────────

function EditSuggestionDialog({
  item,
  open,
  isSubmitting,
  onClose,
  onConfirm,
}: {
  item: BookSuggestionItem | null
  open: boolean
  isSubmitting: boolean
  onClose: () => void
  onConfirm: (payload: SuggestionUpdateData) => void
}) {
  const [title,  setTitle]  = useState(item?.title  ?? "")
  const [author, setAuthor] = useState(item?.author ?? "")

  if (!item) return null

  const handleConfirm = () => {
    onConfirm({
      title:  title.trim()  || undefined,
      author: author.trim() || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpenCheck className="size-4 text-primary" />
            Edit Suggestion
          </DialogTitle>
          <DialogDescription>
            Update the details of this book suggestion.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Author</Label>
            <Input value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting} className="gap-2">
            {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Delete Dialog ──────────────────────────────────────────────────────────────

function DeleteSuggestionDialog({
  item,
  open,
  isSubmitting,
  onClose,
  onConfirm,
}: {
  item: BookSuggestionItem | null
  open: boolean
  isSubmitting: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  if (!item) return null
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="size-4 text-destructive" />
            Delete Suggestion
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the suggestion for{" "}
            <span className="font-medium text-foreground">"{item.title}"</span>?
            This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <XCircle className="size-3.5" />
            )}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function BookSuggestionsDataTable({
  suggestions = [],
  isLoading,
  total = 0,
  page = 1,
  pageSize = 10,
  searchValue = "",
  statusFilter = "",
  onSearchChange,
  onStatusChange,
  onPageChange,
  onCreate,
  onUpdate,
  onDelete,
  updatingId,
}: DataTableProps) {
  // ── Role gate ──────────────────────────────────────────────────────────────
  const { user } = useAuth()
  const isLibrarian = user?.role === "librarian"

  // Non-librarians get read-only view: strip all mutating callbacks.
  const effectiveOnCreate = isLibrarian ? onCreate : undefined
  const effectiveOnUpdate = isLibrarian ? onUpdate : undefined
  const effectiveOnDelete = isLibrarian ? onDelete : undefined

  const [sorting,          setSorting]          = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection,     setRowSelection]     = useState({})
  const [statusValue,      setStatusValue]      = useState(statusFilter || "all")

  const [createDialogOpen,   setCreateDialogOpen] = useState(false)
  const [isCreateSubmitting, setCreateSubmitting] = useState(false)

  const [editItem,         setEditItem]       = useState<BookSuggestionItem | null>(null)
  const [editDialogOpen,   setEditDialogOpen] = useState(false)
  const [isEditSubmitting, setEditSubmitting] = useState(false)

  const [deleteItem,         setDeleteItem]       = useState<BookSuggestionItem | null>(null)
  const [deleteDialogOpen,   setDeleteDialogOpen] = useState(false)
  const [isDeleteSubmitting, setDeleteSubmitting] = useState(false)

  const handleCreateConfirm = async (payload: SuggestionPayload) => {
    if (!effectiveOnCreate) return
    setCreateSubmitting(true)
    await effectiveOnCreate(payload)
    setCreateSubmitting(false)
    setCreateDialogOpen(false)
  }

  const handleEditConfirm = async (payload: SuggestionUpdateData) => {
    if (!editItem || !effectiveOnUpdate) return
    setEditSubmitting(true)
    await effectiveOnUpdate(editItem.id, payload)
    setEditSubmitting(false)
    setEditDialogOpen(false)
    setEditItem(null)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteItem || !effectiveOnDelete) return
    setDeleteSubmitting(true)
    await effectiveOnDelete(deleteItem.id)
    setDeleteSubmitting(false)
    setDeleteDialogOpen(false)
    setDeleteItem(null)
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusValue(value)
    onStatusChange?.(value === "all" ? "" : value)
  }

  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  // ── Columns ────────────────────────────────────────────────────────────────

  const columns: ColumnDef<BookSuggestionItem>[] = [
    {
      accessorKey: "title",
      header: "Book",
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-8 rounded shrink-0 border border-border bg-muted flex items-center justify-center">
              <BookOpenCheck className="size-3.5 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-0.5 max-w-xs">
              <span className="font-medium line-clamp-2 leading-snug">{item.title}</span>
              <span className="text-sm text-muted-foreground truncate">{item.author}</span>
            </div>
          </div>
        )
      },
    },

    {
      accessorKey: "requested_by_username",
      header: "Requested By",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
          {row.getValue("requested_by_username")}
        </span>
      ),
    },

    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },

    {
      accessorKey: "approved_by_username",
      header: "Approved By",
      cell: ({ row }) => {
        const val = row.getValue("approved_by_username") as string | null
        return (
          <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
            {val ?? "—"}
          </span>
        )
      },
    },

    {
      accessorKey: "approved_at",
      header: "Approved At",
      cell: ({ row }) => {
        const val = row.getValue("approved_at") as string | null
        return (
          <span className="text-sm tabular-nums text-muted-foreground">
            {val ? new Date(val).toLocaleDateString() : "—"}
          </span>
        )
      },
    },

    {
      accessorKey: "created_at",
      header: "Submitted",
      cell: ({ row }) => {
        const val = row.getValue("created_at") as string
        return (
          <span className="text-sm tabular-nums text-muted-foreground">
            {val ? new Date(val).toLocaleDateString() : "—"}
          </span>
        )
      },
    },

    // Actions column is only included for librarians.
    // When all three effective callbacks are undefined it is omitted entirely,
    // keeping the table clean for read-only viewers.
    ...(isLibrarian
      ? ([
          {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
              const item       = row.original
              const isUpdating = updatingId != null && updatingId === item.id

              if (isUpdating) {
                return <Loader2 className="size-4 animate-spin text-muted-foreground" />
              }

              return (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                      <EllipsisVertical className="size-4" />
                      <span className="sr-only">More actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">

                    {item.status !== "approved" && effectiveOnUpdate && (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => effectiveOnUpdate(item.id, { status: "approved" })}
                      >
                        <CheckCircle2 className="mr-2 size-4 text-green-500" />
                        Approve
                      </DropdownMenuItem>
                    )}

                    {item.status !== "rejected" && effectiveOnUpdate && (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => effectiveOnUpdate(item.id, { status: "rejected" })}
                      >
                        <XCircle className="mr-2 size-4 text-destructive" />
                        Reject
                      </DropdownMenuItem>
                    )}

                    {item.status !== "pending" && effectiveOnUpdate && (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => effectiveOnUpdate(item.id, { status: "pending" })}
                      >
                        <Undo2 className="mr-2 size-4" />
                        Reset to Pending
                      </DropdownMenuItem>
                    )}

                    {effectiveOnUpdate && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => { setEditItem(item); setEditDialogOpen(true) }}
                        >
                          <BookOpenCheck className="mr-2 size-4" />
                          Edit Details
                        </DropdownMenuItem>
                      </>
                    )}

                    {effectiveOnDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="cursor-pointer text-destructive focus:text-destructive"
                          onClick={() => { setDeleteItem(item); setDeleteDialogOpen(true) }}
                        >
                          <XCircle className="mr-2 size-4" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}

                  </DropdownMenuContent>
                </DropdownMenu>
              )
            },
          },
        ] as ColumnDef<BookSuggestionItem>[])
      : []),
  ]

  const table = useReactTable({
    data: suggestions,
    columns,
    manualPagination: true,
    manualFiltering:  true,
    pageCount,
    onSortingChange:          setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange:     setRowSelection,
    getCoreRowModel:   getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting, columnVisibility, rowSelection },
  })

  return (
    <div className="w-full space-y-4">

      {/* Top bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by title, author, or requester…"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* "Suggest a Book" button is hidden for non-librarians */}
        {effectiveOnCreate && (
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="gap-2 shrink-0 cursor-pointer"
          >
            <BookPlus className="size-4" />
            Suggest a Book
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="grid gap-2 sm:grid-cols-4 sm:gap-4">
        <div className="space-y-2">
          <Label htmlFor="status-filter" className="text-sm font-medium">Status</Label>
          <Select value={statusValue} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="cursor-pointer w-full" id="status-filter">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 sm:col-start-4">
          <Label className="text-sm font-medium">Columns</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="cursor-pointer w-full">
                Visibility <ChevronDown className="ml-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    className="capitalize"
                    checked={col.getIsVisible()}
                    onCheckedChange={(v) => col.toggleVisibility(!!v)}
                  >
                    {col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Loading suggestions…
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No suggestions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          {total > 0 ? (
            <>
              Showing{" "}
              <strong>{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}</strong>
              {" "}of <strong>{total}</strong> suggestion{total !== 1 ? "s" : ""}
            </>
          ) : (
            "No suggestions"
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(page - 1)}
            disabled={page <= 1 || isLoading}
            className="cursor-pointer"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(page + 1)}
            disabled={page >= pageCount || isLoading}
            className="cursor-pointer"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Dialogs — only mounted for librarians since the triggers are hidden otherwise */}
      {isLibrarian && (
        <>
          <CreateSuggestionDialog
            open={createDialogOpen}
            isSubmitting={isCreateSubmitting}
            onClose={() => setCreateDialogOpen(false)}
            onConfirm={handleCreateConfirm}
          />

          <EditSuggestionDialog
            item={editItem}
            open={editDialogOpen}
            isSubmitting={isEditSubmitting}
            onClose={() => { setEditDialogOpen(false); setEditItem(null) }}
            onConfirm={handleEditConfirm}
          />

          <DeleteSuggestionDialog
            item={deleteItem}
            open={deleteDialogOpen}
            isSubmitting={isDeleteSubmitting}
            onClose={() => { setDeleteDialogOpen(false); setDeleteItem(null) }}
            onConfirm={handleDeleteConfirm}
          />
        </>
      )}
    </div>
  )
}