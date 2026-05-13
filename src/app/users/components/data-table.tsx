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
  Star,
  BookOpen,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
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
import type { Paper } from "@/app/research_repository/components/paper"
import { getDeptTheme} from "@/app/research_repository/components/departmentThemes"

// ─── Props ────────────────────────────────────────────────────────────────────

interface CategoryOption {
  label: string
  value: string
}

interface DataTableProps {
  papers: Paper[]
  isLoading?: boolean
  /** Total records from the server (for pagination display) */
  total?: number
  /** Current server page (1-indexed) */
  page?: number
  /** Page size returned by the server — used to compute pageCount correctly */
  pageSize?: number
  /** Controlled search input value (managed + debounced by parent) */
  searchValue?: string
  /** Category options fetched from the API */
  categoryOptions?: CategoryOption[]
  onDeletePaper: (id: string) => void
  onEditPaper: (paper: Paper) => void
  onViewPaper: (paper: Paper) => void
  onAddPaper?: () => void
  /** Called on every keystroke — debouncing is handled by the parent */
  onSearchChange?: (query: string) => void
  onCategoryChange?: (category: string) => void
  onPageChange?: (page: number) => void
}

// ─── Constants ────────────────────────────────────────────────────────────────



// ─── Component ────────────────────────────────────────────────────────────────

export function DataTable({
  papers = [],
  isLoading,
  total = 0,
  page = 1,
  pageSize = 10,
  searchValue = "",
  categoryOptions = [],
  onDeletePaper,
  onEditPaper,
  onViewPaper,
  onAddPaper,
  onSearchChange,
  onCategoryChange,
  onPageChange,
}: DataTableProps) {
  const [sorting, setSorting]                   = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection]         = useState({})
  const [categoryValue, setCategoryValue]       = useState("")

  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  // ── Columns ────────────────────────────────────────────────────────────────

  const columns: ColumnDef<Paper>[] = [
    // Select
    // Title + author
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        const paper = row.original
        return (
          <div className="flex flex-col gap-0.5 max-w-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-medium line-clamp-2 leading-snug">
                {paper.title}
              </span>
              {paper.bestThesis && (
                <Star className="size-3.5 shrink-0 fill-yellow-400 text-yellow-400" />
              )}
            </div>
            <span className="text-sm text-muted-foreground truncate">
              by: {paper.author}
            </span>
          </div>
        )
      },
    },

    // Department
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => {
        const dept  = row.getValue("department") as string
        const theme = getDeptTheme(dept)
        return (
          <Badge
            variant="secondary"
            className="whitespace-nowrap font-medium"
            style={{
              backgroundColor: theme.bgColor,
              color:           theme.textColor,
              borderColor:     theme.accentColor,
            }}
            title={dept}
          >
            {theme.label}
          </Badge>
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
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const cat = row.getValue("category") as string | null | undefined
        return cat ? (
          <span className="text-sm">{cat}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )
      },
    },

    // Views
    {
      accessorKey: "timesViewed",
      header: "Views",
      cell: ({ row }) => {
        const views = row.getValue("timesViewed") as number | undefined
        return (
          <span className="tabular-nums text-sm text-muted-foreground">
            {views?.toLocaleString() ?? "—"}
          </span>
        )
      },
    },

    // Actions
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const paper = row.original
        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => onEditPaper(paper)}
            >
              <Pencil className="size-4" />
              <span className="sr-only">Edit paper</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
                  <EllipsisVertical className="size-4" />
                  <span className="sr-only">More actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer">
                  <BookOpen className="mr-2 size-4" />
                  <a
                    href={paper.readUrl ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full block"
                  >
                    View Abstract
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => onViewPaper(paper)}
                >
                  <Eye className="mr-2 size-4" />
                  View Research Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer"
                  onClick={() => onDeletePaper(paper.id)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete Paper
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  // TanStack Table — sorting & visibility only; filtering/pagination are server-side
  const table = useReactTable({
    data: papers,
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

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleCategoryChange = (value: string) => {
    const normalized = value === "all" ? "" : value
    setCategoryValue(normalized)
    onCategoryChange?.(normalized)
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="w-full space-y-4">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search papers..."
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {onAddPaper && (
          <Button className="cursor-pointer" onClick={onAddPaper}>
            Add Paper
          </Button>
        )}
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="grid gap-2 sm:grid-cols-4 sm:gap-4">

        {/* Category — server-side, options from API */}
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
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Column visibility */}
        <div className="space-y-2 sm:col-start-4">
          <Label htmlFor="column-visibility" className="text-sm font-medium">
            Columns
          </Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild id="column-visibility">
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

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
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
                  Loading papers…
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
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

      {/* ── Pagination ───────────────────────────────────────────────────── */}
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

    </div>
  )
}