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
  BookOpen,
  BookMarked,
  Undo2,
  CircleCheck,
  Loader2,
  AlertTriangle,
  Skull,
  CheckCircle2,
  BookPlus,
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
import { Textarea } from "@/components/ui/textarea"
import type { BorrowedBookItem, ReturnPayload, BorrowPayload } from "@/hooks/use-borrow"
import { useAuth } from "@/hooks/use-auth"

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface OverdueSettingOption {
  id: string
  fee_per_day: string
}

interface DataTableProps {
  borrowedBooks: BorrowedBookItem[]
  isLoading?: boolean
  total?: number
  page?: number
  pageSize?: number
  searchValue?: string
  statusFilter?: string
  overdueSettings?: OverdueSettingOption[]
  onSearchChange?: (query: string) => void
  onStatusChange?: (status: string) => void
  onPageChange?: (page: number) => void
  onReturn?: (item: BorrowedBookItem, payload: ReturnPayload) => Promise<void>
  onMarkBorrowed?: (item: BorrowedBookItem, dueDate: string, isDamaged: boolean, remarks?: string) => Promise<void>
  onMarkPaid?: (item: BorrowedBookItem) => Promise<void>
  onBorrow?: (payload: BorrowPayload) => Promise<void>
  updatingId?: string | null
}

type ReturnCondition = "good" | "damaged" | "lost"
type BookCondition   = "good" | "damaged"

// ─── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    pending:  { label: "Pending",  variant: "outline"     },
    borrowed: { label: "Borrowed", variant: "default"     },
    returned: { label: "Returned", variant: "secondary"   },
    overdue:  { label: "Overdue",  variant: "destructive" },
    lost:     { label: "Lost",     variant: "destructive" },
  }
  const entry = map[status] ?? { label: status, variant: "outline" as const }
  return (
    <Badge variant={entry.variant} className="capitalize text-xs">
      {entry.label}
    </Badge>
  )
}

// ─── Borrow Dialog ─────────────────────────────────────────────────────────────

function BorrowDialog({
  open,
  isSubmitting,
  overdueSettings = [],
  onClose,
  onConfirm,
}: {
  open: boolean
  isSubmitting: boolean
  overdueSettings?: OverdueSettingOption[]
  onClose: () => void
  onConfirm: (payload: BorrowPayload) => void
}) {
  const [copyId,         setCopyId]         = useState("")
  const [dueDate,        setDueDate]        = useState("")
  const [condition,      setCondition]      = useState<BookCondition>("good")
  const [overdueSetting, setOverdueSetting] = useState<string>("")
  const [borrowStatus,   setBorrowStatus]   = useState<"pending" | "borrowed">("borrowed")
  const [remarks,        setRemarks]        = useState("")

  const conditionOptions: {
    value: BookCondition
    label: string
    description: string
    icon: React.ReactNode
  }[] = [
    {
      value:       "good",
      label:       "Good Condition",
      description: "Book is undamaged and complete",
      icon:        <CheckCircle2 className="size-4 text-green-500" />,
    },
    {
      value:       "damaged",
      label:       "Already Damaged",
      description: "Book has pre-existing wear or damage",
      icon:        <AlertTriangle className="size-4 text-yellow-500" />,
    },
  ]

  const handleConfirm = () => {
    if (!copyId.trim() || !dueDate) return
    const payload: BorrowPayload = {
      copy:            copyId.trim(),
      due_date:        new Date(dueDate).toISOString(),
      status:          borrowStatus,
      is_damaged:      condition === "damaged",
      overdue_setting: overdueSetting || undefined,
      remarks:         remarks.trim() || undefined,
    }
    onConfirm(payload)
  }

  const handleClose = () => {
    setCopyId("")
    setDueDate("")
    setCondition("good")
    setOverdueSetting("")
    setBorrowStatus("borrowed")
    setRemarks("")
    onClose()
  }

  const isValid = copyId.trim() !== "" && dueDate !== ""

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookPlus className="size-4 text-primary" />
            Borrow a Book
          </DialogTitle>
          <DialogDescription>
            Record a new book borrowing. Fill in the copy ID, due date, and condition.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="borrow-copy-id" className="text-sm font-medium">
              Book Copy ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="borrow-copy-id"
              placeholder="Enter copy UUID or barcode…"
              value={copyId}
              onChange={(e) => setCopyId(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="borrow-due-date" className="text-sm font-medium">
              Due Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="borrow-due-date"
              type="date"
              value={dueDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Book Condition at Borrowing</Label>
            <div className="grid gap-2">
              {conditionOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCondition(opt.value)}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors
                    ${condition === opt.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:bg-muted/50"
                    }`}
                >
                  {opt.icon}
                  <div>
                    <p className="text-sm font-medium leading-none mb-0.5">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Initial Status</Label>
            <Select value={borrowStatus} onValueChange={(v) => setBorrowStatus(v as "pending" | "borrowed")}>
              <SelectTrigger className="w-full cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="borrowed">Borrowed — book taken immediately</SelectItem>
                <SelectItem value="pending">Pending — awaiting approval</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {overdueSettings.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Overdue Fee Setting{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Select value={overdueSetting} onValueChange={setOverdueSetting}>
                <SelectTrigger className="w-full cursor-pointer">
                  <SelectValue placeholder="Select fee schedule…" />
                </SelectTrigger>
                <SelectContent>
                  {overdueSettings.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      ₱{parseFloat(s.fee_per_day).toFixed(2)} / day
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="borrow-remarks" className="text-sm font-medium">
              Remarks{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="borrow-remarks"
              placeholder="Add any notes about this borrowing…"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              className="resize-none"
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
            Confirm Borrow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Mark as Borrowed Dialog ───────────────────────────────────────────────────

function MarkBorrowedDialog({
  item,
  open,
  isSubmitting,
  onClose,
  onConfirm,
}: {
  item: BorrowedBookItem | null
  open: boolean
  isSubmitting: boolean
  onClose: () => void
  onConfirm: (dueDate: string, isDamaged: boolean, remarks?: string) => void
}) {
  const [dueDate,   setDueDate]   = useState("")
  const [condition, setCondition] = useState<BookCondition>("good")
  const [remarks,   setRemarks]   = useState("")

  if (!item) return null

  const conditionOptions: {
    value: BookCondition
    label: string
    description: string
    icon: React.ReactNode
  }[] = [
    {
      value:       "good",
      label:       "Good Condition",
      description: "Book is undamaged and complete",
      icon:        <CheckCircle2 className="size-4 text-green-500" />,
    },
    {
      value:       "damaged",
      label:       "Damaged",
      description: "Book has pre-existing wear or damage",
      icon:        <AlertTriangle className="size-4 text-yellow-500" />,
    },
  ]

  const handleConfirm = () => {
    if (!dueDate) return
    onConfirm(new Date(dueDate).toISOString(), condition === "damaged", remarks.trim() || undefined)
  }

  const handleClose = () => {
    setDueDate("")
    setCondition("good")
    setRemarks("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookMarked className="size-4 text-primary" />
            Mark as Borrowed
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{item.book_title}</span>
            {" · "}Borrowed by{" "}
            <span className="font-medium text-foreground">{item.user}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="mark-due-date" className="text-sm font-medium">
              Due Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="mark-due-date"
              type="date"
              value={dueDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDueDate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Must be today or later — this replaces any prior due date.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Book Condition</Label>
            <div className="grid gap-2">
              {conditionOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCondition(opt.value)}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors
                    ${condition === opt.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:bg-muted/50"
                    }`}
                >
                  {opt.icon}
                  <div>
                    <p className="text-sm font-medium leading-none mb-0.5">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="mark-remarks" className="text-sm font-medium">
              Remarks{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Textarea
              id="mark-remarks"
              placeholder="Add any notes…"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting || !dueDate} className="gap-2">
            {isSubmitting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <BookMarked className="size-3.5" />
            )}
            Confirm Borrow
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Return Dialog ─────────────────────────────────────────────────────────────

function ReturnDialog({
  item,
  open,
  isSubmitting,
  onClose,
  onConfirm,
}: {
  item: BorrowedBookItem | null
  open: boolean
  isSubmitting: boolean
  onClose: () => void
  onConfirm: (payload: ReturnPayload) => void
}) {
  const [condition, setCondition] = useState<ReturnCondition>("good")
  const [remarks,   setRemarks]   = useState("")

  if (!item) return null

  const conditionOptions: {
    value: ReturnCondition
    label: string
    description: string
    icon: React.ReactNode
  }[] = [
    {
      value:       "good",
      label:       "Good Condition",
      description: "Book returned undamaged",
      icon:        <CheckCircle2 className="size-4 text-green-500" />,
    },
    {
      value:       "damaged",
      label:       "Damaged",
      description: "Book has wear, tears, or markings",
      icon:        <AlertTriangle className="size-4 text-yellow-500" />,
    },
    {
      value:       "lost",
      label:       "Lost",
      description: "Book was not returned / cannot be found",
      icon:        <Skull className="size-4 text-destructive" />,
    },
  ]

  const handleConfirm = () => {
    const payload: ReturnPayload = {
      status:      condition === "lost" ? "lost" : "returned",
      returned_at: condition === "lost" ? null : new Date().toISOString(),
      is_damaged:  condition === "damaged",
      remarks:     remarks.trim() || undefined,
    }
    onConfirm(payload)
  }

  const handleClose = () => {
    setCondition("good")
    setRemarks("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Undo2 className="size-4 text-primary" />
            Process Return
          </DialogTitle>
          <DialogDescription>
            <span className="font-medium text-foreground">{item.book_title}</span>
            {" · "}Borrowed by{" "}
            <span className="font-medium text-foreground">{item.user}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Return Condition</Label>
          <div className="grid gap-2">
            {conditionOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setCondition(opt.value)}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors
                  ${condition === opt.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border hover:bg-muted/50"
                  }`}
              >
                {opt.icon}
                <div>
                  <p className="text-sm font-medium leading-none mb-0.5">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="return-remarks" className="text-sm font-medium">
            Remarks{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <Textarea
            id="return-remarks"
            placeholder="Add any notes about this return…"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={2}
            className="resize-none"
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="gap-2"
            variant={condition === "lost" ? "destructive" : "default"}
          >
            {isSubmitting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Undo2 className="size-3.5" />
            )}
            {condition === "lost" ? "Mark as Lost" : "Confirm Return"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function BorrowedBooksDataTable({
  borrowedBooks = [],
  isLoading,
  total = 0,
  page = 1,
  pageSize = 10,
  searchValue = "",
  statusFilter = "",
  overdueSettings = [],
  onSearchChange,
  onStatusChange,
  onPageChange,
  onReturn,
  onMarkBorrowed,
  onMarkPaid,
  onBorrow,
  updatingId,
}: DataTableProps) {
  const { user } = useAuth()
  const isLibrarian = user?.role === "librarian"

  const [sorting,          setSorting]          = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection,     setRowSelection]     = useState({})
  const [statusValue,      setStatusValue]      = useState(statusFilter || "all")

  const [returnItem,         setReturnItem]       = useState<BorrowedBookItem | null>(null)
  const [returnDialogOpen,   setReturnDialogOpen] = useState(false)
  const [isReturnSubmitting, setReturnSubmitting] = useState(false)

  const [markBorrowedItem,         setMarkBorrowedItem]         = useState<BorrowedBookItem | null>(null)
  const [markBorrowedDialogOpen,   setMarkBorrowedDialogOpen]   = useState(false)
  const [isMarkBorrowedSubmitting, setMarkBorrowedSubmitting]   = useState(false)

  const [borrowDialogOpen,   setBorrowDialogOpen] = useState(false)
  const [isBorrowSubmitting, setBorrowSubmitting] = useState(false)

  const openReturnDialog       = (item: BorrowedBookItem) => { setReturnItem(item);       setReturnDialogOpen(true) }
  const openMarkBorrowedDialog = (item: BorrowedBookItem) => { setMarkBorrowedItem(item); setMarkBorrowedDialogOpen(true) }

  const handleReturnConfirm = async (payload: ReturnPayload) => {
    if (!returnItem || !onReturn) return
    setReturnSubmitting(true)
    await onReturn(returnItem, payload)
    setReturnSubmitting(false)
    setReturnDialogOpen(false)
    setReturnItem(null)
  }

  const handleMarkBorrowedConfirm = async (dueDate: string, isDamaged: boolean, remarks?: string) => {
    if (!markBorrowedItem || !onMarkBorrowed) return
    setMarkBorrowedSubmitting(true)
    await onMarkBorrowed(markBorrowedItem, dueDate, isDamaged, remarks)
    setMarkBorrowedSubmitting(false)
    setMarkBorrowedDialogOpen(false)
    setMarkBorrowedItem(null)
  }

  const handleBorrowConfirm = async (payload: BorrowPayload) => {
    if (!onBorrow) return
    setBorrowSubmitting(true)
    await onBorrow(payload)
    setBorrowSubmitting(false)
    setBorrowDialogOpen(false)
  }

  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  // ── Columns ────────────────────────────────────────────────────────────────

  const baseColumns: ColumnDef<BorrowedBookItem>[] = [
    {
      accessorKey: "book_title",
      header: "Book",
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="h-10 w-8 rounded shrink-0 border border-border bg-muted flex items-center justify-center">
              <BookOpen className="size-3.5 text-muted-foreground" />
            </div>
            <div className="flex flex-col gap-0.5 max-w-xs">
              <span className="font-medium line-clamp-2 leading-snug">{item.book_title}</span>
              <span className="text-sm text-muted-foreground truncate">{item.book_author}</span>
            </div>
          </div>
        )
      },
    },

    {
      accessorKey: "user",
      header: "Borrower",
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.getValue("user")}</span>
      ),
    },

    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },

    {
      accessorKey: "borrowed_at",
      header: "Borrowed",
      cell: ({ row }) => {
        const val = row.getValue("borrowed_at") as string
        return (
          <span className="text-sm tabular-nums text-muted-foreground">
            {val ? new Date(val).toLocaleDateString() : "—"}
          </span>
        )
      },
    },

    {
      accessorKey: "due_date",
      header: "Due Date",
      cell: ({ row }) => {
        const val       = row.getValue("due_date") as string
        const isActive  = ["borrowed", "overdue", "pending"].includes(row.original.status)
        const isOverdue = val && new Date(val) < new Date() && isActive
        return (
          <span className={`text-sm tabular-nums ${isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
            {val ? new Date(val).toLocaleDateString() : "—"}
          </span>
        )
      },
    },

    {
      accessorKey: "returned_at",
      header: "Returned",
      cell: ({ row }) => {
        const val = row.getValue("returned_at") as string | null
        return (
          <span className="text-sm tabular-nums text-muted-foreground">
            {val ? new Date(val).toLocaleDateString() : "—"}
          </span>
        )
      },
    },

    {
      accessorKey: "total_fee",
      header: "Fee",
      cell: ({ row }) => {
        const item = row.original
        const fee  = parseFloat(item.total_fee ?? "0")
        return (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm tabular-nums">
              {fee > 0 ? `₱${fee.toFixed(2)}` : "—"}
            </span>
            {fee > 0 && (
              <Badge variant={item.is_paid ? "secondary" : "destructive"} className="text-xs w-fit">
                {item.is_paid ? "Paid" : "Unpaid"}
              </Badge>
            )}
          </div>
        )
      },
    },

    {
      accessorKey: "is_damaged",
      header: "Condition",
      cell: ({ row }) => {
        const damaged = row.getValue("is_damaged") as boolean
        return damaged ? (
          <Badge variant="destructive" className="text-xs">Damaged</Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">Good</Badge>
        )
      },
    },
  ]

  // ── Actions column — librarians only ───────────────────────────────────────

  const actionsColumn: ColumnDef<BorrowedBookItem> = {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const item       = row.original
      const isUpdating = updatingId != null && updatingId === item.id
      const isPending  = item.status === "pending"
      const canReturn  = ["borrowed", "overdue", "pending"].includes(item.status)
      const hasFee     = parseFloat(item.total_fee ?? "0") > 0

      if (isUpdating) {
        return <Loader2 className="size-4 animate-spin text-muted-foreground" />
      }

      if (!canReturn && !(hasFee && !item.is_paid)) return null

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
              <EllipsisVertical className="size-4" />
              <span className="sr-only">More actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">

            {isPending && onMarkBorrowed && (
              <DropdownMenuItem className="cursor-pointer" onClick={() => openMarkBorrowedDialog(item)}>
                <BookMarked className="mr-2 size-4" />
                Mark as Borrowed
              </DropdownMenuItem>
            )}

            {canReturn && onReturn && (
              <>
                {isPending && onMarkBorrowed && <DropdownMenuSeparator />}
                <DropdownMenuItem className="cursor-pointer" onClick={() => openReturnDialog(item)}>
                  <Undo2 className="mr-2 size-4" />
                  Process Return
                </DropdownMenuItem>
              </>
            )}

            {hasFee && !item.is_paid && onMarkPaid && (
              <>
                {canReturn && <DropdownMenuSeparator />}
                <DropdownMenuItem className="cursor-pointer" onClick={() => onMarkPaid(item)}>
                  <CircleCheck className="mr-2 size-4" />
                  Mark Fee as Paid
                </DropdownMenuItem>
              </>
            )}

          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  }

  // Only include the actions column for librarians
  const columns: ColumnDef<BorrowedBookItem>[] = isLibrarian
    ? [...baseColumns, actionsColumn]
    : baseColumns

  const table = useReactTable({
    data: borrowedBooks,
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

  const handleStatusChange = (value: string) => {
    const normalized = value === "all" ? "" : value
    setStatusValue(value)
    onStatusChange?.(normalized)
  }

  return (
    <div className="w-full space-y-4">

      {/* Top bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by borrower or book..."
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Borrow button — librarians only */}
        {isLibrarian && onBorrow && (
          <Button onClick={() => setBorrowDialogOpen(true)} className="gap-2 shrink-0 cursor-pointer">
            <BookPlus className="size-4" />
            Borrow a Book
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="grid gap-2 sm:grid-cols-4 sm:gap-4">
        <div className="space-y-2">
          <Label htmlFor="status-filter" className="text-sm font-medium">Status</Label>
          <Select value={statusValue} onValueChange={handleStatusChange}>
            <SelectTrigger className="cursor-pointer w-full" id="status-filter">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="borrowed">Borrowed</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
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
                  Loading borrowed books…
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
                  No borrowed books found.
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
              {" "}of <strong>{total}</strong> record{total !== 1 ? "s" : ""}
            </>
          ) : (
            "No records"
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

      {/* Dialogs — only rendered for librarians */}
      {isLibrarian && (
        <>
          <BorrowDialog
            open={borrowDialogOpen}
            isSubmitting={isBorrowSubmitting}
            overdueSettings={overdueSettings}
            onClose={() => setBorrowDialogOpen(false)}
            onConfirm={handleBorrowConfirm}
          />

          <MarkBorrowedDialog
            item={markBorrowedItem}
            open={markBorrowedDialogOpen}
            isSubmitting={isMarkBorrowedSubmitting}
            onClose={() => { setMarkBorrowedDialogOpen(false); setMarkBorrowedItem(null) }}
            onConfirm={handleMarkBorrowedConfirm}
          />

          <ReturnDialog
            item={returnItem}
            open={returnDialogOpen}
            isSubmitting={isReturnSubmitting}
            onClose={() => { setReturnDialogOpen(false); setReturnItem(null) }}
            onConfirm={handleReturnConfirm}
          />
        </>
      )}

    </div>
  )
}