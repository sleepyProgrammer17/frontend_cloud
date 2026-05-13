import type { DigitalResourceItem } from "@/hooks/useDigitalResources"
import type { Resource } from "./resource"

interface DigitalDetails {
  publisher?: string
  description?: string
  [key: string]: unknown
}

type CategoryGroup = {
  category: number | null
  category_name: string | null
  items: DigitalResourceItem[]
}

export function groupByCategory(items: DigitalResourceItem[]): CategoryGroup[] {
  const map = new Map<string, CategoryGroup>()

  for (const item of items) {
    const key = item.category != null ? String(item.category) : "__none__"
    if (!map.has(key)) {
      map.set(key, { category: item.category, category_name: item.category_name, items: [] })
    }
    map.get(key)!.items.push(item)
  }

  return Array.from(map.values())
}

export function mapDigitalToResource(item: DigitalResourceItem): Resource {
  const details = (item.details ?? {}) as DigitalDetails

  return {
    id:            String(item.id),
    title:         item.title,
    author:        item.author ?? "Unknown Author",
    category:      String(item.category) ?? null,
    category_name: item.category_name ?? null,
    year:          item.published_year ?? new Date(item.created_at).getFullYear(),
    abstract:      details.description ?? "",
    keywords:      item.keywords
                     ? item.keywords.split(",").map((k) => k.trim()).filter(Boolean)
                     : [],
    type:          item.type ?? null,
    publisher:     details.publisher ?? null,
    readUrl:       item.signed_file_url ?? item.file_path ?? null,
    imageUrl:      item.signed_image_url ?? null,
    timesViewed:   item.times_read,
    uploadedBy:    null,
  }
}