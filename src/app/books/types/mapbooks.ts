// mappers/physicalBook.ts

// mappers/physicalBook.ts

import type { PhysicalBookItem } from "@/hooks/use-physicalbooks";
import type { Book } from "./book";

export function toBook(item: PhysicalBookItem): Book {
  return {
    id: String(item.id),
    title: item.title,
    author: item.author ?? "",
    isbn: item.isbn,
    keywords: item.keywords
      ? item.keywords.split(",").map((k) => k.trim()).filter(Boolean)
      : [],
    copies_total: item.copies_total,
    copies_available: item.copies_available,
    timesBorrowed: item.times_borrowed,
    category: item.category != null ? String(item.category) : null,
    category_name: item.category_name,
    imageUrl: item.signed_image_url,

    type: (item.details?.type as string) ?? null,
    publisher: (item.details?.publisher as string) ?? null,
    summary: (item.details?.description as string) ?? "",
    year: (item.details?.year as number) ?? 0,
  };
}

export function toBookList(items: PhysicalBookItem[]): Book[] {
  return items.map(toBook);
}

// ─── grouped ────────────────────────────────────────────────────────────────

export interface BookGroup {
  category: string | null;
  category_name: string;
  books: Book[];
}

export function groupByCategory(items: PhysicalBookItem[]): BookGroup[] {
  const map = new Map<string, BookGroup>();

  for (const item of items) {
    const key = item.category != null ? String(item.category) : "__none__";
    const label = item.category_name ?? "Uncategorized";

    if (!map.has(key)) {
      map.set(key, {
        category: item.category != null ? String(item.category) : null,
        category_name: label,
        books: [],
      });
    }

    map.get(key)!.books.push(toBook(item));
  }

  return Array.from(map.values()).sort((a, b) =>
    a.category_name.localeCompare(b.category_name)
  );
}