// ─────────────────────────────────────────────────────────────────────────────
// VerticalResourceRow — single row in the Digital Resources list
// ─────────────────────────────────────────────────────────────────────────────

import { FileText } from "lucide-react"
import type { DigitalResourceItem } from "@/hooks/useDigitalResources"

export function VerticalResourceRow({
  resource,
  onSelect,
}: {
  resource: DigitalResourceItem
  onSelect: (r: DigitalResourceItem) => void
}) {
  const hasFile = !!(resource.signed_file_url ?? resource.file_path)

  return (
    <div
      className="flex gap-3 group cursor-pointer items-start py-3 border-b border-border last:border-0 hover:bg-muted/40 rounded-lg px-2 transition-colors"
      onClick={() => onSelect(resource)}
    >
      {/* Thumbnail */}
      <div
        className="flex-none rounded-md overflow-hidden shadow-sm bg-muted border border-border"
        style={{ width: 52, height: 74 }}
      >
        {resource.signed_image_url ? (
          <img
            src={resource.signed_image_url}
            alt={resource.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText className="h-5 w-5 text-muted-foreground/30" />
          </div>
        )}
      </div>

      {/* Text details */}
      <div className="flex flex-col gap-1 min-w-0 flex-1 pt-0.5">

        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {resource.category_name && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none bg-primary/10 text-primary border border-primary/20">
              {resource.category_name}
            </span>
          )}
          {resource.type && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full leading-none bg-muted text-muted-foreground border border-border">
              {resource.type}
            </span>
          )}
          <span
            className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full leading-none ${
              hasFile
                ? "bg-green-500/10 text-green-600 border border-green-500/20"
                : "bg-red-500/10 text-red-500 border border-red-500/20"
            }`}
          >
            {hasFile ? "File available" : "No file"}
          </span>
        </div>

        {/* Title */}
        <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2 group-hover:underline transition-colors">
          {resource.title}
        </p>

        {/* Author */}
        {resource.author && (
          <p className="text-[10px] text-muted-foreground">
            by {resource.author}
          </p>
        )}

        {/* Published year */}
        {resource.published_year && (
          <p className="text-[10px] text-muted-foreground hidden sm:block">
            {resource.published_year}
          </p>
        )}

      </div>
    </div>
  )
}