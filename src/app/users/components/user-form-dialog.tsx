"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import ResponsiveForm, {
  type FormField,
  type FormValues,
  type FormMode,
} from "@/components/ReusableForm"

import {
  useCreateResearch,
  useUpdateResearch,
  type ResearchFormData,
} from "@/hooks/useResearch"

import { useDepartmentList } from "@/hooks/useDepartment"
import { useCategoryList } from "@/hooks/useCategory"

// ─── Types ───────────────────────────────────────────────

interface ResearchFormDialogProps {
  onSuccess?: () => void
  mode?: FormMode
  initialData?: FormValues
  paperId?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

// ─── Fields ──────────────────────────────────────────────

function buildFields(
  departmentOptions: { label: string; value: number }[],
  categoryOptions: { label: string; value: number }[]
): FormField[] {
  return [
    { name: "title", label: "Title", type: "text", colSpan: 2, required: true },
    { name: "keywords", label: "Keywords", type: "text", colSpan: 2 },
    {
      name: "department",
      label: "Department",
      type: "select",
      required: true,
      options: departmentOptions,
    },
    {
      name: "category",
      label: "Category",
      type: "select",
      options: categoryOptions,
    },
    { name: "year", label: "Year", type: "number", required: true },
    { name: "adviser", label: "Adviser", type: "text" },
    { name: "authors", label: "Authors", type: "text", colSpan: 2 },
    { name: "abstract", label: "Abstract", type: "textarea", colSpan: 2 },
    { name: "best_thesis", label: "Best Thesis", type: "checkbox" },
    {
      name: "file",
      label: "File (PDF)",
      type: "file",
      accept: "application/pdf",
    },
  ]
}

// ─── Defaults ────────────────────────────────────────────

const EMPTY_DEFAULTS: FormValues = {
  title: "",
  keywords: "",
  department: "",
  category: "",
  year: "",
  adviser: "",
  authors: "",
  abstract: "",
  best_thesis: false,
  file: null,
}

// ─── Mapper ──────────────────────────────────────────────

function toPayload(values: FormValues, isUpdate = false): ResearchFormData {
  const details: Record<string, unknown> = {}

  if (values.year)     details.year     = String(values.year)
  if (values.adviser)  details.adviser  = String(values.adviser)
  if (values.authors)  details.authors  = String(values.authors)
  if (values.abstract) details.abstract = String(values.abstract)

  return {
    title:      String(values.title ?? ""),
    keywords:   values.keywords  ? String(values.keywords)  : undefined,
    department: values.department ? String(values.department) : null,
    category:   values.category  ? String(values.category)  : null,
    details:    Object.keys(details).length ? details : undefined,
    ...(isUpdate
      ? { file: values.file instanceof File ? values.file : undefined }
      : { file: values.file instanceof File ? values.file : null }
    ),
  }
}

// ─── Component ───────────────────────────────────────────

export function ResearchFormDialog({
  onSuccess,
  mode = "create",
  initialData,
  paperId,
  open: controlledOpen,
  onOpenChange,
}: ResearchFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  const { create, isLoading: creating, error } = useCreateResearch()
  const { update, isLoading: updating } = useUpdateResearch()

  const { data: departments, fetchAll: fetchDepartments } = useDepartmentList()
  const { data: categories, fetchAll: fetchCategories } = useCategoryList()

  useEffect(() => {
    if (open) {
      fetchDepartments()
      fetchCategories()
    }
  }, [open, fetchDepartments, fetchCategories])

  const departmentOptions = useMemo(
    () => departments?.map((d) => ({ label: d.name, value: d.id })) ?? [],
    [departments]
  )

  const categoryOptions = useMemo(
    () => categories?.map((c) => ({ label: c.name, value: c.id })) ?? [],
    [categories]
  )

  const fields = buildFields(departmentOptions, categoryOptions)

  const isOptionsReady =
    mode === "create" ||
    (departmentOptions.length > 0 && categoryOptions.length > 0)

  const resolvedDefaults = useMemo(() => {
    if (mode === "create") return EMPTY_DEFAULTS
    if (!initialData) return EMPTY_DEFAULTS

    // Wait until options have loaded to avoid falling back to raw IDs
    if (departmentOptions.length === 0 || categoryOptions.length === 0) return null

    const deptMatch = departmentOptions.find(
      (d) => d.label === initialData.department || String(d.value) === String(initialData.department)
    )
    const catMatch = categoryOptions.find(
      (c) => c.label === initialData.category || String(c.value) === String(initialData.category)
    )

    const isView = mode === "view"

    return {
      ...initialData,
      department: deptMatch
        ? isView ? deptMatch.label : deptMatch.value
        : initialData.department,
      category: catMatch
        ? isView ? catMatch.label : catMatch.value
        : initialData.category,
    }
  }, [mode, initialData, departmentOptions, categoryOptions])

  async function handleSubmit(values: FormValues) {
    if (mode === "view") return

    if (mode === "create") {
      const payload = toPayload(values, false)
      const res = await create(payload)
      if (res.ok) {
        onSuccess?.()
        setOpen(false)
      }
    }

    if (mode === "update" && paperId) {
      const payload = toPayload(values, true)
      const res = await update(paperId, payload)
      if (res.ok) {
        onSuccess?.()
        setOpen(false)
      }
    }
  }

  const isLoading = creating || updating

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {mode === "create" && controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Add Paper
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Add Research Paper"}
            {mode === "update" && "Edit Research Paper"}
            {mode === "view" && "View Research Paper"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" && "Fill in the details and save."}
            {mode === "update" && "Update the research information."}
            {mode === "view" && "Viewing research details."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="text-sm text-destructive border p-2 rounded">
            {error}
          </p>
        )}

        {!isOptionsReady || (mode !== "create" && resolvedDefaults === null) ? (
          <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
            Loading form…
          </div>
        ) : (
          <ResponsiveForm
            key={mode === "create" ? "create" : resolvedDefaults ? "ready" : "loading"}
            fields={fields}
            defaultValues={resolvedDefaults ?? EMPTY_DEFAULTS}
            onSubmit={handleSubmit}
            submitText={
              mode === "update"
                ? isLoading ? "Updating..." : "Update"
                : isLoading ? "Saving..."   : "Save"
            }
            mode={mode}
            onCancel={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}