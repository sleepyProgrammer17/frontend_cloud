// ─────────────────────────────────────────────────────────────────────────────
// Department Color Map
// Usage: import { getDeptTheme, DEPARTMENT_THEMES } from "@/lib/departmentThemes"
// ─────────────────────────────────────────────────────────────────────────────

export const DEPARTMENT_THEMES: Record<
  string,
  { bgColor: string; textColor: string; accentColor: string; label: string }
> = {
  "College of Education": { bgColor: "#1A3A6B", textColor: "#FFFFFF", accentColor: "#93C5FD", label: "COEd" },
  "College of Computer Studies": { bgColor: "#14532D", textColor: "#FFFFFF", accentColor: "#6EE7B7", label: "CCS" },
  "College of Criminal Justice Education": { bgColor: "#360d0d", textColor: "#FFFFFF", accentColor: "#FCA5A5", label: "CCJE" },
  "College of Liberal Arts": { bgColor: "#3B0764", textColor: "#FFFFFF", accentColor: "#C4B5FD", label: "CLA" },
  "College of Business Administration And Accountancy": { bgColor: "#dab204", textColor: "#FFFFFF", accentColor: "#fffaea", label: "CBAA" },
  "Senior High School": { bgColor: "#7e1717", textColor: "#FFFFFF", accentColor: "#FCA5A5", label: "SHS" },
  "Technical-Vocational-Livelihood": { bgColor: "#18d0dd", textColor: "#FFFFFF", accentColor: "#93C5FD", label: "TVL" },
  "Graduate School": { bgColor: "#4e0055", textColor: "#FFFFFF", accentColor: "#c06be7", label: "GS" },
  "College of Nursing And Midwifery": { bgColor: "#cc5d03", textColor: "#FFFFFF", accentColor: "#F9A8D4", label: "CMN" },

}

export function getDeptTheme(dept: string) {
  return (
    DEPARTMENT_THEMES[dept] ?? {
      bgColor: "#1A2744",
      textColor: "#FFFFFF",
      accentColor: "#5BA3D9",
      label: dept,
    }
  )
}