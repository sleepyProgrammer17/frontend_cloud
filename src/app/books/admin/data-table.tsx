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
  Eye,
  Pencil,
  Trash2,
  Search,
  BookOpen,
  QrCode,
  Download,
  Copy,
  CheckCheck,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Resource } from "./resource"

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategoryOption {
  label: string
  value: number
}

interface Copy {
  id: string
  copy_number: number
  status: string
  barcode: string
  book: string
  created_at: string
}

interface DataTableProps {
  resources: Resource[]
  isLoading?: boolean
  total?: number
  page?: number
  pageSize?: number
  searchValue?: string
  categoryOptions?: CategoryOption[]
  onDeleteResource: (id: string) => void
  onEditResource: (resource: Resource) => void
  onViewResource: (resource: Resource) => void
  onAddResource?: () => void
  onSearchChange?: (query: string) => void
  onCategoryChange?: (category: string) => void
  onPageChange?: (page: number) => void
}

// ─── QR Modal ─────────────────────────────────────────────────────────────────

function QRModal({
  resource,
  open,
  onClose,
}: {
  resource: Resource | null
  open: boolean
  onClose: () => void
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  if (!resource) return null

  const copies: Copy[] = (resource as any).copies ?? []

  const getQRUrl = (copyId: string) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(copyId)}`

  const handleDownload = async (copyId: string, copyNumber: number) => {
    const url = getQRUrl(copyId)
    const res = await fetch(url)
    const blob = await res.blob()
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `qr-copy-${copyNumber}-${copyId.slice(0, 8)}.png`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const handleCopyId = (copyId: string) => {
    navigator.clipboard.writeText(copyId)
    setCopiedId(copyId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="size-5 text-primary" />
            QR Codes — {resource.title}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Each QR code encodes its copy ID. Scan to identify the physical copy.
          </p>
        </DialogHeader>

        {copies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
            <div className="rounded-full bg-muted p-4">
              <QrCode className="size-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No copies registered for this resource.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-[60vh]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-3 py-1">
              {copies.map((copy) => (
                <div
                  key={copy.id}
                  className="rounded-xl border bg-card p-4 flex flex-col items-center gap-3 shadow-sm"
                >
                  {/* Header */}
                  <div className="w-full flex items-center justify-between">
                    <span className="text-sm font-semibold">
                      Copy #{copy.copy_number}
                    </span>
                    <Badge
                      variant={copy.status === "available" ? "default" : "secondary"}
                      className="capitalize text-xs"
                    >
                      {copy.status}
                    </Badge>
                  </div>

                  {/* QR Image */}
                  <div className="rounded-lg border bg-white p-2">
                    <img
                      src={getQRUrl(copy.id)}
                      alt={`QR code for copy ${copy.copy_number}`}
                      width={180}
                      height={180}
                      className="block"
                    />
                  </div>

                  {/* Barcode label */}
                  <p className="text-xs text-muted-foreground font-mono">
                    Barcode: {copy.barcode}
                  </p>

                  {/* Copy ID row */}
                  <div className="w-full flex items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-1.5">
                    <span className="flex-1 text-xs font-mono text-muted-foreground truncate">
                      {copy.id}
                    </span>
                    <button
                      onClick={() => handleCopyId(copy.id)}
                      className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                      title="Copy ID"
                    >
                      {copiedId === copy.id ? (
                        <CheckCheck className="size-3.5 text-green-500" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Download button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 cursor-pointer"
                    onClick={() => handleDownload(copy.id, copy.copy_number)}
                  >
                    <Download className="size-3.5" />
                    Download QR
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DataTable({
  resources = [],
  isLoading,
  total = 0,
  page = 1,
  pageSize = 10,
  searchValue = "",
  categoryOptions = [],
  onDeleteResource,
  onEditResource,
  onViewResource,
  onAddResource,
  onSearchChange,
  onCategoryChange,
  onPageChange,
}: DataTableProps) {
  const [sorting, setSorting]                   = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection]         = useState({})
  const [categoryValue, setCategoryValue]       = useState("")

  // ── QR state ──────────────────────────────────────────────────────────────
  const [qrResource, setQrResource] = useState<Resource | null>(null)
  const [qrOpen, setQrOpen]         = useState(false)

  const openQR = (resource: Resource) => {
    setQrResource(resource)
    setQrOpen(true)
  }

  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  // ── Columns ────────────────────────────────────────────────────────────────

  const columns: ColumnDef<Resource>[] = [

    // Title + author + thumbnail
    {
      accessorKey: "title",
      header: "Resource",
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center gap-3">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="h-10 w-8 rounded object-cover shrink-0 border border-border"
              />
            ) : (
              <div className="h-10 w-8 rounded shrink-0 border border-border bg-muted flex items-center justify-center">
                <BookOpen className="size-3.5 text-muted-foreground" />
              </div>
            )}
            <div className="flex flex-col gap-0.5 max-w-xs">
              <span className="font-medium line-clamp-2 leading-snug">
                {item.title}
              </span>
              <span className="text-sm text-muted-foreground truncate">
                {item.author}
              </span>
            </div>
          </div>
        )
      },
    },

    // Total Copies
    {
      accessorKey: "copies_total",
      header: "Total Copies",
      cell: ({ row }) => {
        const totalCopies = row.getValue("copies_total") as number | undefined
        return totalCopies != null ? (
          <span className="tabular-nums">{totalCopies}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )
      },
    },

    // Publisher
    {
      accessorKey: "publisher",
      header: "Publisher",
      cell: ({ row }) => {
        const publisher = row.getValue("publisher") as string | null | undefined
        return publisher ? (
          <span className="text-sm">{publisher}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )
      },
    },

    // Year
    {
      accessorKey: "year",
      header: "Year",
      cell: ({ row }) => (
        <span className="tabular-nums">{row.getValue("year")}</span>
      ),
    },

    // Category
    {
      accessorKey: "category_name",
      header: "Category",
      cell: ({ row }) => {
        const cat = row.getValue("category_name") as string | null | undefined
        return cat ? (
          <span className="text-sm">{cat}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )
      },
    },

    // Borrowed
    {
      accessorKey: "timesBorrowed",
      header: "Borrowed",
      cell: ({ row }) => {
        const views = row.getValue("timesBorrowed") as number | undefined
        return (
          <span className="tabular-nums text-sm text-muted-foreground">
            {views != null ? views.toLocaleString() : "—"}
          </span>
        )
      },
    },

    // Actions
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const item = row.original
        const copies: Copy[] = (item as any).copies ?? []
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => onEditResource(item)}
            >
              <Pencil className="size-4" />
              <span className="sr-only">Edit resource</span>
            </Button>

            {/* QR Code button — shown when copies exist */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => openQR(item)}
              title={
                copies.length === 0
                  ? "No copies — QR unavailable"
                  : `Generate QR for ${copies.length} cop${copies.length === 1 ? "y" : "ies"}`
              }
            >
              <QrCode className="size-4" />
              <span className="sr-only">Generate QR codes</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                  <EllipsisVertical className="size-4" />
                  <span className="sr-only">More actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => onViewResource(item)}
                >
                  <Eye className="mr-2 size-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => openQR(item)}
                >
                  <QrCode className="mr-2 size-4" />
                  Generate QR Codes
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={() => onDeleteResource(item.id)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete Resource
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: resources,
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

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCategoryChange = (value: string) => {
    const normalized = value === "all" ? "" : value
    setCategoryValue(normalized)
    onCategoryChange?.(normalized)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="w-full space-y-4">

      {/* Top bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {onAddResource && (
          <Button className="cursor-pointer" onClick={onAddResource}>
            Add Books
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="grid gap-2 sm:grid-cols-4 sm:gap-4">
        <div className="space-y-2">
          <Label htmlFor="category-filter" className="text-sm font-medium">
            Category
          </Label>
          <Select
            value={categoryValue || "all"}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="cursor-pointer w-full" id="category-filter">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoryOptions.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Column visibility */}
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Loading resources…
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
                  No results.
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
              <strong>
                {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}
              </strong>{" "}
              of <strong>{total}</strong> result{total !== 1 ? "s" : ""}
            </>
          ) : (
            "No results"
          )}
        </div>

        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="hidden sm:flex items-center space-x-2">
            <p className="text-sm font-medium">Page</p>
            <strong className="text-sm">
              {page} of {pageCount}
            </strong>
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
      </div>

      {/* QR Code Modal */}
      <QRModal
        resource={qrResource}
        open={qrOpen}
        onClose={() => setQrOpen(false)}
      />

    </div>
  )
}