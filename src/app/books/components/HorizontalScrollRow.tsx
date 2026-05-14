import { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { BookCard } from "./BookCard"
import type { Book } from "../types/book"

interface HorizontalScrollRowProps {
  books: Book[]
  title: string
  showSeeAll?: boolean
  onSelect?: (book: Book) => void
}

export function HorizontalScrollRow({ books, title, showSeeAll = true, onSelect }: HorizontalScrollRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return
    const w = scrollRef.current.querySelector<HTMLElement>(".snap-start")?.offsetWidth ?? 140
    scrollRef.current.scrollBy({ left: dir === "right" ? w + 12 : -(w + 12), behavior: "smooth" })
  }

  return (
    <section className="space-y-3 w-full min-w-0">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
        <div className="flex items-center gap-2 flex-shrink-0">
          {showSeeAll && (
            <button className="text-xs text-muted-background font-medium hover:underline whitespace-nowrap">
              See All
            </button>
          )}
          <div className="flex gap-1">
            <button
              onClick={() => scroll("left")}
              className="rounded-full border border-border bg-primary p-1 shadow-sm hover:bg-muted transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-3 w-3 hover:text-primary text-primary-foreground" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="rounded-full border border-border bg-primary p-1 shadow-sm hover:bg-muted transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-3 w-3 hover:text-primary text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onClick={() => onSelect?.(book)}
          />
        ))}
      </div>
    </section>
  )
}