// ─────────────────────────────────────────────────────────────────────────────
// VerticalBookRow — single row in the Physical Books list
// Usage: import { VerticalBookRow } from "@/components/books/VerticalBookRow"
// ─────────────────────────────────────────────────────────────────────────────

import type { PhysicalBookItem } from "@/hooks/use-physicalbooks"

export function VerticalBookRow({
  book,
  onSelect,
}: {
  book: PhysicalBookItem
  onSelect: (b: PhysicalBookItem) => void
}) {
  const available = book.copies_available > 0

  return (
    <div
      className="flex gap-3 group cursor-pointer items-start py-3 border-b border-border last:border-0 hover:bg-muted/40 rounded-lg px-2 transition-colors"
      onClick={() => onSelect(book)}
    >
      {/* Book cover thumbnail */}
      <div
        className="flex-none rounded-md overflow-hidden shadow-sm bg-muted border border-border"
        style={{ width: 52, height: 74 }}
      >
        {book.signed_image_url ? (
          <img
            src={book.signed_image_url}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-lg font-black text-muted-foreground/30">?</span>
          </div>
        )}
      </div>

      {/* Text details */}
      <div className="flex flex-col gap-1 min-w-0 flex-1 pt-0.5">

        {/* Badges row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {book.category_name && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none bg-primary/10 text-primary border border-primary/20">
              {book.category_name}
            </span>
          )}
          <span
            className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full leading-none ${
              available
                ? "bg-green-500/10 text-green-600 border border-green-500/20"
                : "bg-red-500/10 text-red-500 border border-red-500/20"
            }`}
          >
            {available ? `${book.copies_available} available` : "Unavailable"}
          </span>
        </div>

        {/* Title */}
        <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2 group-hover:underline transition-colors">
          {book.title}
        </p>

        {/* Author */}
        {book.author && (
          <p className="text-[10px] text-muted-foreground">
            by {book.author}
          </p>
        )}

        {/* ISBN + borrow count */}
        <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed hidden sm:block">
          {[
            book.isbn && `ISBN: ${book.isbn}`,
            `${book.times_borrowed} borrows`,
            book.copies_total && `${book.copies_total} total copies`,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>

      </div>
    </div>
  )
}