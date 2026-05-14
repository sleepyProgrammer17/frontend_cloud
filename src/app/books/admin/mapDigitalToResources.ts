import type { PhysicalBookItem } from "@/hooks/use-physicalbooks"
import type { Resource, Copy } from "./resource"

interface PhysicalBookDetails {
  publisher?:      string
  description?:    string
  published_year?: string
  call_number?:    string
  [key: string]:   unknown
}

export function mapPhysicalBookToResource(item: PhysicalBookItem): Resource {
  const details = (item.details ?? {}) as PhysicalBookDetails

  return {
    id:               String(item.id),
    title:            item.title,
    author:           item.author ?? "Unknown Author",
    category:         item.category != null ? String(item.category) : null,
    category_name:    item.category_name ?? null,
    copies_available: item.copies_available,
    copies_total:     item.copies_total,
    copies:           (item.copies ?? []) as Copy[],   // ← map it here

    abstract:  details.description ?? "",
    keywords:  item.keywords
                 ? item.keywords.split(",").map((k) => k.trim()).filter(Boolean)
                 : [],

    publisher:    details.publisher ?? null,
    year:         details.published_year ?? null,
    call_number:  details.call_number ?? null,

    imageUrl:      item.signed_image_url ?? null,
    isbn:          item.isbn ?? null,
    timesBorrowed: item.times_borrowed,
  }
}