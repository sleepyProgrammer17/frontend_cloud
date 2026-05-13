import {
  CheckCircle2,
  Circle,
  Clock,
  PlayCircle,
} from "lucide-react"

import type { LucideIcon } from "lucide-react"

type Option = {
  value: string
  label: string
  icon?: LucideIcon
}

// ✅ APPLY TYPE HERE
export const categories: Option[] = [
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature" },
  { value: "documentation", label: "Docs" },
  { value: "improvement", label: "Improvement" },
  { value: "refactor", label: "Refactor" },
]

// ✅ APPLY TYPE HERE
export const statuses: Option[] = [
  { value: "pending", label: "Pending", icon: Clock },
  { value: "todo", label: "Todo", icon: Circle },
  { value: "in progress", label: "In Progress", icon: PlayCircle },
  { value: "completed", label: "Completed", icon: CheckCircle2 },
]

// ✅ APPLY TYPE HERE
export const priorities: Option[] = [
  { label: "Minor", value: "minor" },
  { label: "Normal", value: "normal" },
  { label: "Important", value: "important" },
  { label: "Critical", value: "critical" },
]