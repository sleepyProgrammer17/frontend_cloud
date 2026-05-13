"use client"

import { useState, useEffect } from "react"
import { Search, X, ChevronDown, Check, SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { HorizontalScrollRow } from "./HorizontalScrollRow"
import { VerticalResourceRow } from "./VerticalScollRow"
import { useDigitalSearch, useDigitalList } from "@/hooks/useDigitalResources"
import type { DigitalResourceItem } from "@/hooks/useDigitalResources"
import { useCategoryList } from "@/hooks/useCategory"
import { ResourceDetailPage } from "./bookdetail"
import { mapDigitalToResource, groupByCategory } from "../components/mapDigitalToResource"
import type { Resource } from "../components/resource"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function DigitalReaderApp({ className, ...props }: React.ComponentProps<"div">) {
  const [query, setQuery] = useState("")
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)

  // ✅ isSearching is true when EITHER query OR category is active
  const isSearching = query.trim().length > 0 || selectedCategoryId !== null

  const { data: searchData, isLoading: searchLoading, search } = useDigitalSearch()
  const { data: allResources, fetchAll } = useDigitalList()
  const { data: categories, fetchAll: fetchCategories } = useCategoryList()

  useEffect(() => {
    fetchAll()
    fetchCategories()
  }, [fetchAll, fetchCategories])

  // ✅ Trigger search whenever query OR category changes
  useEffect(() => {
    const timer = setTimeout(() => {
      search({
        query: query.trim() || undefined,
        category: selectedCategoryId ? String(selectedCategoryId) : undefined,
      })
    }, 400)
    return () => clearTimeout(timer)
  }, [query, selectedCategoryId, search])

  // ✅ No more client-side double-filtering — trust the API response
  const searchResults = searchData?.results ?? []

  // ✅ Browse view still uses client-side filter (no search active)
  const filteredResources = selectedCategoryId
    ? (allResources ?? []).filter((r) => r.category === selectedCategoryId)
    : (allResources ?? [])

  const selectedCategory = categories?.find((c) => c.id === selectedCategoryId)

  const handleSelectItem = (item: DigitalResourceItem) => {
    setSelectedResource(mapDigitalToResource(item))
  }

  const handleCategorySelect = (id: number | null) => {
    setSelectedCategoryId(id)
  }

  if (selectedResource) {
    return (
      <ResourceDetailPage
        resource={selectedResource}
        onBack={() => setSelectedResource(null)}
      />
    )
  }

  return (
    <div className={cn("w-full min-h-screen bg-background text-foreground", className)} {...props}>
      <div className="px-4 sm:px-6 lg:px-8 pb-8">

        {/* ── Search bar + Category filter ── */}
        <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-sm py-3 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 mb-2">
          <div className="flex items-center gap-2 max-w-xl">

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search resources, authors, topics…"
                className="w-full h-9 rounded-full border border-border bg-muted/50 pl-8 pr-8 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              />
              {query.trim().length > 0 && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-9 gap-1.5 rounded-full border-border bg-muted/50 text-xs font-normal shrink-0 transition",
                    selectedCategoryId && "border-primary/50 bg-primary/5 text-primary"
                  )}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">
                    {selectedCategory ? selectedCategory.name : "Category"}
                  </span>
                  {selectedCategoryId && (
                    <Badge
                      variant="secondary"
                      className="h-4 w-4 rounded-full p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground ml-0.5"
                    >
                      1
                    </Badge>
                  )}
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                  Filter by category
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleCategorySelect(null)}
                  className="flex items-center justify-between text-xs cursor-pointer"
                >
                  <span>All categories</span>
                  {selectedCategoryId === null && <Check className="h-3.5 w-3.5 text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {!categories && (
                  <div className="px-2 py-3 flex flex-col gap-1.5 animate-pulse">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-3 bg-muted rounded w-full" />
                    ))}
                  </div>
                )}

                {categories?.map((category) => (
                  <DropdownMenuItem
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className="flex items-center justify-between text-xs cursor-pointer"
                  >
                    <span>{category.name}</span>
                    {selectedCategoryId === category.id && <Check className="h-3.5 w-3.5 text-primary" />}
                  </DropdownMenuItem>
                ))}

                {categories?.length === 0 && (
                  <div className="px-2 py-3 text-xs text-muted-foreground text-center">
                    No categories found
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {selectedCategoryId && (
            <div className="flex items-center gap-1.5 mt-2 max-w-xl">
              <span className="text-xs text-muted-foreground">Filtering by:</span>
              <button
                onClick={() => handleCategorySelect(null)}
                className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary rounded-full px-2.5 py-0.5 hover:bg-primary/20 transition"
              >
                {selectedCategory?.name}
                <X className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {/* ── Search / Filter results ── */}
        {isSearching ? (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground px-1">
              {searchLoading ? (
                "Searching…"
              ) : (
                <>
                  {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
                  {query.trim() && (
                    <> for <span className="font-semibold text-foreground">"{query}"</span></>
                  )}
                  {selectedCategoryId && (
                    <> in <span className="font-semibold text-foreground">{selectedCategory?.name}</span></>
                  )}
                </>
              )}
            </p>

            {searchLoading && (
              <div className="flex flex-col gap-3 px-2 pt-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-3 items-start animate-pulse">
                    <div className="rounded-md bg-muted flex-none" style={{ width: 52, height: 74 }} />
                    <div className="flex flex-col gap-2 flex-1 pt-1">
                      <div className="h-2.5 bg-muted rounded w-1/3" />
                      <div className="h-3 bg-muted rounded w-3/4" />
                      <div className="h-2.5 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!searchLoading && searchResults.length > 0 && (
              <div className="flex flex-col">
                {searchResults.map((r) => (
                  <VerticalResourceRow key={r.id} resource={r} onSelect={handleSelectItem} />
                ))}
              </div>
            )}

            {!searchLoading && searchResults.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
                <Search className="h-8 w-8 opacity-20" />
                <p className="text-xs">
                  No resources found
                  {query.trim() && ` for "${query}"`}
                  {selectedCategoryId && ` in "${selectedCategory?.name}"`}
                </p>
                {selectedCategoryId && (
                  <button
                    onClick={() => handleCategorySelect(null)}
                    className="text-xs text-primary hover:underline mt-1"
                  >
                    Clear category filter
                  </button>
                )}
              </div>
            )}
          </div>

        ) : (

          /* ── Default browse view (no query, no category) ── */
          <div className="flex flex-col gap-5">
            {groupByCategory(filteredResources).map((group) => (
              <HorizontalScrollRow
                key={group.category ?? "__none__"}
                title={group.category_name}
                books={group.items.map(mapDigitalToResource)}
                onSelect={(r: Resource) => setSelectedResource(r)}
              />
            ))}

            {!allResources &&
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="space-y-3 animate-pulse">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="flex gap-3">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="rounded-md bg-muted flex-none" style={{ width: 100, height: 140 }} />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

      </div>
    </div>
  )
}