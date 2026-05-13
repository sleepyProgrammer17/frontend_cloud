import { BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ContinueReadingCardProps {
  title: string
  description: string
  currentPage: number
  totalPages: number
}

export function ContinueReadingCard({ title, description, currentPage, totalPages }: ContinueReadingCardProps) {
  const progress = (currentPage / totalPages) * 100

  return (
    <Card className="overflow-hidden border border-border shadow-sm w-full">
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">
                Continue Reading
              </p>
              <h2 className="text-base sm:text-lg font-bold leading-snug text-foreground mb-1.5">{title}</h2>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{description}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-4 rounded-full font-semibold flex-shrink-0"
              >
                <BookOpen className="h-3 w-3 mr-1.5" />
                Read Now
              </Button>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                • Page {currentPage} of {totalPages}
              </span>
            </div>
          </div>

          <BookCoverDecoration />
        </div>

        <div className="px-4 pb-4">
          <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BookCoverDecoration() {
  return (
    <div className="flex-none w-[80px] sm:w-[100px]">
      <div
        className="relative rounded-xl overflow-hidden shadow-lg"
        style={{
          aspectRatio: "2/3",
          background: "linear-gradient(160deg, #1e293b 0%, #0f172a 60%, #1a3a2a 100%)",
        }}
      >
        <div className="absolute inset-0 flex items-end p-2">
          <div className="w-full">
            <p className="text-[7px] text-emerald-400 font-semibold uppercase tracking-wider mb-0.5">The</p>
            <p className="text-xs font-black text-white leading-none">Beauty</p>
            <p className="text-[8px] font-light text-slate-300 leading-tight">of the Night</p>
          </div>
        </div>
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white pointer-events-none"
            style={{
              width: i % 3 === 0 ? 2 : 1,
              height: i % 3 === 0 ? 2 : 1,
              top: `${(i * 13 + 7) % 85}%`,
              left: `${(i * 23 + 5) % 90}%`,
              opacity: 0.3 + (i % 5) * 0.1,
            }}
          />
        ))}
      </div>
    </div>
  )
}