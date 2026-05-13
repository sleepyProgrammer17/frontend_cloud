"use client"

import { useEffect, useCallback, useState, useRef } from "react"
import { BaseLayout } from "@/components/layouts/base-layout"
import { DataTable } from "./components/data-table"
import { useDigitalSearch, useDeleteDigital } from "@/hooks/useDigitalResources"
import { useCategoryList } from "@/hooks/useCategory"
import type { Resource } from "./components/resource"
import { mapDigitalToResource } from "./components/mapDigitalToResource"
import { DigitalFormDialog } from "./components/user-form-dialog"
import type { FormValues } from "@/components/ReusableForm"

// ─── Mapper ─────────────────────────────────────────────
function resourceToFormValues(resource: Resource): FormValues {
  return {
    title: resource.title ?? "",
    keywords: resource.keywords.join(", "),
    category: resource.category ?? "",
    published_year: resource.year ?? "",
    author: resource.author ?? "",
    publisher: resource.publisher ?? "",
    summary: resource.abstract ?? "",
    type: resource.type ?? "",
    category_name: resource.category_name ?? "",

    image: null,
    file: null,

    // ✅ IMPORTANT
    imagePreview: resource.imageUrl ?? null,
    filePreview: resource.readUrl ?? null,
  }
}

// ─── Page ───────────────────────────────────────────────
export default function DigitalResourcesPage() {
  const { data, isLoading, search } = useDigitalSearch()
  const { remove, isLoading: isDeleting } = useDeleteDigital()
  const { data: categories, fetchAll: fetchCategories } = useCategoryList()

  const [searchInput, setSearchInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const PAGE_SIZE = 10
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editResource, setEditResource] = useState<Resource | null>(null)
  const [editInitialData, setEditInitialData] = useState<FormValues | null>(null)

  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewResource, setViewResource] = useState<Resource | null>(null)
  const [viewInitialData, setViewInitialData] = useState<FormValues | null>(null)

  // ── Fetch Categories ───────────────────────────────────
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // ── SEARCH TRIGGER ─────────────────────────────────────
  const triggerSearch = useCallback(() => {
    search({
      query: searchQuery,
      category: categoryFilter,
      page: currentPage,
    })
  }, [search, searchQuery, categoryFilter, currentPage])

  useEffect(() => {
    triggerSearch()
  }, [triggerSearch])

  // ── DATA FROM API ──────────────────────────────────────
  const resources: Resource[] = (data?.results ?? []).map(mapDigitalToResource)
  const total = data?.total ?? 0

  const categoryOptions = (categories ?? []).map((c) => ({
    label: c.name,
    value: c.id,
  }))

  // ── Handlers ───────────────────────────────────────────
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

  const handleDeleteResource = useCallback(
    async (id: string) => {
      const result = await remove(id)
      if (result.ok) triggerSearch()
    },
    [remove, triggerSearch]
  )

  const handleEditResource = useCallback((resource: Resource) => {
    setEditResource(resource)
    setEditInitialData(resourceToFormValues(resource))
    setEditDialogOpen(true)
  }, [])

  const handleViewResource = useCallback((resource: Resource) => {
    setViewResource(resource)
    setViewInitialData(resourceToFormValues(resource))
    setViewDialogOpen(true)
  }, [])

  const handleEditSuccess = useCallback(() => {
    triggerSearch()
    setEditDialogOpen(false)
  }, [triggerSearch])

  // ── Render ─────────────────────────────────────────────
  return (
    <BaseLayout
      title="Digital Resources"
      description="Browse and manage digital resources and e-books"
    >
      <div className="flex flex-col gap-4">

        <DigitalFormDialog
          mode="create"
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={() => {
            triggerSearch()
            setCreateDialogOpen(false)
          }}
        />

        {editResource && editInitialData && (
          <DigitalFormDialog
            mode="update"
            resourceId={editResource.id}
            initialData={editInitialData}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSuccess={handleEditSuccess}
          />
        )}

        {viewResource && viewInitialData && (
          <DigitalFormDialog
            mode="view"
            resourceId={viewResource.id}
            initialData={viewInitialData}
            open={viewDialogOpen}
            onOpenChange={setViewDialogOpen}
          />
        )}

        <div className="@container/main px-4 lg:px-6">
          <DataTable
            resources={resources}
            isLoading={isLoading || isDeleting}
            total={total}
            page={currentPage}
            pageSize={PAGE_SIZE}
            searchValue={searchInput}
            categoryOptions={categoryOptions}
            onDeleteResource={handleDeleteResource}
            onEditResource={handleEditResource}
            onViewResource={handleViewResource}
            onAddResource={() => setCreateDialogOpen(true)}
            onSearchChange={handleSearchChange}
            onCategoryChange={handleCategoryChange}
            onPageChange={setCurrentPage}
          />
        </div>

      </div>
    </BaseLayout>
  )
}