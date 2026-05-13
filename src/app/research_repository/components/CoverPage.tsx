// ─────────────────────────────────────────────────────────────────────────────
// CoverPage — reusable cover thumbnail
// Usage: import { CoverPage } from "@/components/research/CoverPage"
// ─────────────────────────────────────────────────────────────────────────────

import { cn } from "@/lib/utils"
import { getDeptTheme } from "./departmentThemes"

interface CoverPageProps {
  title?: string
  author?: string
  department?: string
  footerLines?: string[]
  titleSize?: number
  className?: string
}

export function CoverPage({
  title = "Research Paper Title",
  author = "Author Name",
  department = "College of Education",
  footerLines = [],
  titleSize = 9,
  className = "",
}: CoverPageProps) {
  const theme = getDeptTheme(department)

  return (
    <div
      className={cn("relative flex flex-col items-center rounded", className)}
      style={{
        backgroundColor: theme.bgColor,
        color: theme.textColor,
        fontFamily: "'Georgia', serif",
        padding: "20px 14px 16px",
        width: "100%",
        height: "100%",
      }}
    >
      <img
        src="mc.png"
        alt="Mabini Colleges"
        style={{ width: 36, height: 36, marginBottom: 6, objectFit: "contain" }}
      />

      <p style={{ fontSize: "7px", textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "center", opacity: 0.7, marginBottom: 8 }}>
        Mabini Colleges
      </p>

      <div style={{ width: "55%", height: "0.5px", backgroundColor: theme.accentColor, opacity: 0.6, marginBottom: 10 }} />

      <h3 style={{ fontSize: `${titleSize}px`, fontWeight: "bold", textAlign: "center",textTransform: "uppercase", lineHeight: 1.35, marginBottom: 8, color: theme.textColor, flexGrow: 1 }}>
        {title}
      </h3>

      <p style={{ fontSize: "6px", opacity: 0.8, textAlign: "center", marginBottom: "auto" }}>
        <em>By</em> <strong>{author}</strong>
      </p>

      <div style={{ width: "55%", height: "0.5px", backgroundColor: theme.accentColor, opacity: 0.6, margin: "10px 0" }} />

      {footerLines.length > 0 && (
        <div style={{ fontSize: "7px", textAlign: "center", opacity: 0.75, lineHeight: 1.8 }}>
          {footerLines.map((line, i) => <p key={i}>{line}</p>)}
        </div>
      )}
    </div>
  )
}