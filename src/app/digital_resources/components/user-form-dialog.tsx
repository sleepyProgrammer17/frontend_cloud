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
  useCreateDigital,
  useUpdateDigital,
  type DigitalResourceFormData,
} from "@/hooks/useDigitalResources"

import { useCategoryList } from "@/hooks/useCategory"

// ─── Types ───────────────────────────────────────────────

interface DigitalFormDialogProps {
  onSuccess?: () => void
  mode?: FormMode
  initialData?: FormValues
  resourceId?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

// ─── Fields ──────────────────────────────────────────────

function buildFields(
  categoryOptions: { label: string; value: number }[]
): FormField[] {
  return [
    { name: "title", label: "Title", type: "text", colSpan: 2, required: true },

    { name: "keywords", label: "Keywords", type: "text", colSpan: 2 },

    {
      name: "category",
      label: "Category",
      type: "select",
      options: categoryOptions,
    },

    {
      name: "type",
      label: "Type",
      type: "select",
      options: [
        { label: "Science", value: "science" },
        { label: "Technology", value: "technology" },
        { label: "Engineering", value: "engineering" },
        { label: "Mathematics", value: "math" },
      ],
    },

    { name: "author", label: "Author", type: "text", colSpan: 2 },

    {
      name: "published_year",
      label: "Published Year",
      type: "number",
      required: true,
    },

    { name: "publisher", label: "Publisher", type: "text" },

    {
      name: "summary",
      label: "Summary",
      type: "textarea",
      colSpan: 2,
    },

    {
      name: "image",
      label: "Book Cover",
      type: "image",
      colSpan: 2,
    },

    {
      name: "file",
      label: "File (PDF)",
      type: "file",
      accept: "application/pdf",
      colSpan: 2,
    },
  ]
}

// ─── Defaults ────────────────────────────────────────────

const EMPTY_DEFAULTS: FormValues = {
  title: "",
  keywords: "",
  category: "",
  type: "",
  published_year: "",
  author: "",
  publisher: "",
  summary: "",
  image: null,
  file: null,

  // ✅ NEW
  imagePreview: null,
  filePreview: null,
}

// ─── Mapper ──────────────────────────────────────────────

function toPayload(values: FormValues): DigitalResourceFormData {
  const details: Record<string, unknown> = {}

  const toStr = (val: unknown): string | null => {
    if (val === null || val === undefined) return null
    return String(val)
  }

  if (values.publisher) details.publisher = toStr(values.publisher)
  if (values.summary) details.description = toStr(values.summary)

  return {
    title: String(values.title ?? ""),
    keywords: values.keywords ? toStr(values.keywords) : null,
    type: values.type ? toStr(values.type) : null,
    author: values.author ? toStr(values.author) : null,

    published_year:
      typeof values.published_year === "number"
        ? values.published_year
        : values.published_year
        ? Number(values.published_year)
        : null,

    category: values.category ? String(values.category) : null,
    details: Object.keys(details).length ? details : undefined,

    image: values.image instanceof File ? values.image : null,
    file: values.file instanceof File ? values.file : null,
  }
}

// ─── Component ───────────────────────────────────────────

export function DigitalFormDialog({
  onSuccess,
  mode = "create",
  initialData,
  resourceId,
  open: controlledOpen,
  onOpenChange,
}: DigitalFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  const { create, isLoading: creating, error } = useCreateDigital()
  const { update, isLoading: updating } = useUpdateDigital()

  const { data: categories, fetchAll: fetchCategories } = useCategoryList()

  useEffect(() => {
    if (open) fetchCategories()
  }, [open, fetchCategories])

  const categoryOptions = useMemo(
    () => categories?.map((c) => ({ label: c.name, value: c.id })) ?? [],
    [categories]
  )

  const fields = buildFields(categoryOptions)

const resolvedDefaults = useMemo(() => {
  if (mode === "create") return EMPTY_DEFAULTS


  return {
    ...EMPTY_DEFAULTS,
    ...initialData,

    // ✅ UPDATE mode → keep ID (for select)
    // ✅ VIEW mode → show LABEL
    category:
      initialData?.category !== null &&
      initialData?.category !== undefined
        ? mode === "view"
          ? String(initialData.category_name)
          : String(initialData.category)
        : "",

    type:
      initialData?.type !== null &&
      initialData?.type !== undefined
        ? String(initialData.type)
        : "",

    image:
      initialData?.image ??
      initialData?.imagePreview ??
      null,

    file:
      initialData?.file ??
      initialData?.filePreview ??
      null,
  }
}, [mode, initialData, categoryOptions])

  // ─── Submit ───────────────────────────────────────────

  async function handleSubmit(values: FormValues) {
    if (mode === "view") return

    const payload = toPayload(values)

    if (mode === "create") {
      const res = await create(payload)
      if (res.ok) {
        onSuccess?.()
        setOpen(false)
      }
    }

    if (mode === "update" && resourceId) {
      const res = await update(resourceId, payload)
      if (res.ok) {
        onSuccess?.()
        setOpen(false)
      }
    }
  }

  const isLoading = creating || updating

  // ─── UI ───────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {mode === "create" && controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Add Resource
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Add Resource"}
            {mode === "update" && "Edit Resource"}
            {mode === "view" && "View Resource"}
          </DialogTitle>

          <DialogDescription>
            {mode === "create" && "Fill in the details and save."}
            {mode === "update" && "Update the resource information."}
            {mode === "view" && "Viewing resource details."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="text-sm text-destructive border p-2 rounded">
            {error}
          </p>
        )}

        <ResponsiveForm
          fields={fields}
          defaultValues={resolvedDefaults}
          onSubmit={handleSubmit}
          submitText={
            mode === "update"
              ? isLoading
                ? "Updating..."
                : "Update"
              : isLoading
              ? "Saving..."
              : "Save"
          }
          mode={mode}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}