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
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import type { Resource } from "./resource"

// ─── Props ────────────────────────────────────────────────────────────────────

interface CategoryOption {
  label: string
  value: number 
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

  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  // ── Columns ────────────────────────────────────────────────────────────────

  const columns: ColumnDef<Resource>[] = [
    // Select
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center px-2">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center px-2">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(!!v)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },

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

    // Type
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string | null | undefined
        return type ? (
          <Badge variant="secondary" className="capitalize whitespace-nowrap">
            {type}
          </Badge>
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

    // Views
    {
      accessorKey: "timesViewed",
      header: "Views",
      cell: ({ row }) => {
        const views = row.getValue("timesViewed") as number | undefined
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
                  disabled={!item.readUrl}
                  
                >
                   <BookOpen className="mr-2 size-4" />
                   <a
                   href={item.readUrl ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                   
                    Open File
</a>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => onViewResource(item)}
                >
                  <Eye className="mr-2 size-4" />
                  View Details
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
            Add Resource
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
  <SelectItem key={opt.value} value={String(opt.value)}>  {/* 👈 String() */}
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

    </div>
  )
}