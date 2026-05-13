import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { BookOfYearEntry } from "./types"

// ─── Community CTA ─────────────────────────────────────────────────────────────

export function CommunityCTA() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-emerald-600 p-5 text-white shadow-md">
      <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-emerald-500/40 pointer-events-none" />
      <div className="absolute -bottom-8 -left-4 h-28 w-28 rounded-full bg-emerald-700/40 pointer-events-none" />
      <div className="relative">
        <h2 className="text-lg font-extrabold leading-snug mb-4">
          Join our book lovers community here now
        </h2>
        <Button
          size="sm"
          className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold text-xs h-8 px-5 rounded-full shadow"
        >
          Join Now
        </Button>
      </div>
    </div>
  )
}

// ─── Book of the Year ──────────────────────────────────────────────────────────

export function BookOfYearList({ entries }: { entries: BookOfYearEntry[] }) {
  return (
    <Card className="border border-border shadow-sm">
      <CardContent className="p-4">
        <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          Book of the Year
        </h2>
        <div className="flex flex-col gap-3">
          {entries.map((book) => (
            <div key={book.rank} className="flex items-center gap-3 group cursor-pointer">
              <div
                className="w-8 h-10 rounded-md flex-none shadow-sm"
                style={{ backgroundColor: book.color, opacity: 0.85 }}
              />
              <div className="flex items-start gap-1.5 min-w-0 flex-1">
                <span className="text-xs font-bold text-muted-foreground mt-0.5 w-3 flex-none">{book.rank}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground leading-tight group-hover:text-emerald-500 transition-colors line-clamp-1">
                    {book.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    <span className="uppercase tracking-wide opacity-60 mr-1">{book.genre}</span>
                    by {book.author}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}