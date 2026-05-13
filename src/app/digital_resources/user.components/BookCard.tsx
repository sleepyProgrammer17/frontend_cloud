import type { Resource } from "../components/resource"

const BOOK_COLORS = [
  "#c0392b","#27ae60","#2980b9","#8e44ad","#e67e22","#16a085",
  "#d35400","#1abc9c","#2c3e50","#f39c12","#7f8c8d","#e74c3c",
]

interface BookCardProps {
  resource: Resource
  onClick?: () => void
}

export function BookCard({ resource, onClick }: BookCardProps) {
  return (
    <div
      className="flex-none w-[clamp(90px,22vw,130px)] snap-start group cursor-pointer"
      onClick={onClick}
    >
      <div
        className="relative overflow-hidden rounded-lg bg-muted shadow-sm group-hover:shadow-md transition-shadow duration-200"
        style={{ aspectRatio: "2/3" }}
      >
        <img
          src={resource.imageUrl ?? ""}
          alt={resource.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const img = e.currentTarget
            img.style.display = "none"
            const parent = img.parentElement
            if (parent && !parent.querySelector(".fallback-label")) {
              const colorIndex = resource.id
                ? parseInt(resource.id, 10) % BOOK_COLORS.length
                : 0
              parent.style.background = BOOK_COLORS[isNaN(colorIndex) ? 0 : colorIndex]
              const label = document.createElement("div")
              label.className = "fallback-label"
              label.style.cssText =
                "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:8px;text-align:center;font-size:11px;font-weight:700;color:white;line-height:1.3;"
              label.textContent = resource.title
              parent.appendChild(label)
            }
          }}
        />
        {resource.category_name && (
          <div className="absolute top-1.5 left-1.5">
            <span className="text-[9px] font-semibold bg-black/60 text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm leading-none">
              {resource.category_name}
            </span>
          </div>
        )}
      </div>
      <p className="mt-1.5 text-[11px] font-semibold text-foreground leading-tight line-clamp-2">{resource.title}</p>
      <p className="text-[10px] text-muted-foreground line-clamp-1">by {resource.author}</p>
    </div>
  )
}