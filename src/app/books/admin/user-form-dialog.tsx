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
  useCreatePhysicalBook,
  useUpdatePhysicalBook,
  type PhysicalBookFormData,
} from "@/hooks/use-physicalbooks"

import { useCategoryList } from "@/hooks/useCategory"

// ─── Types ───────────────────────────────────────────────

interface PhysicalBookFormDialogProps {
  onSuccess?:     () => void
  mode?:          FormMode
  initialData?:   FormValues
  resourceId?:    string
  open?:          boolean
  onOpenChange?:  (open: boolean) => void
}

// ─── Fields ──────────────────────────────────────────────

function buildFields(
  categoryOptions: { label: string; value: number }[]
): FormField[] {
  return [
    { name: "title",          label: "Title",          type: "text",     colSpan: 2, required: true },
    { name: "keywords",       label: "Keywords",       type: "text",     colSpan: 2 },
    {
      name: "category",
      label: "Category",
      type: "select",
      options: categoryOptions,
      colSpan: 2,
    },
    { name: "author",         label: "Author",         type: "text",     colSpan: 2 },
    { name: "published_year", label: "Published Year", type: "number" },
    { name: "publisher",      label: "Publisher",      type: "text" },
    { name: "summary",        label: "Summary",        type: "textarea", colSpan: 2 },
    { name: "isbn",           label: "ISBN",           type: "text",     colSpan: 2 },
    { name: "copies_total",   label: "Total Copies",   type: "number",   colSpan: 2 },
    { name: "call_number",    label: "Call Number",    type: "text",     colSpan: 2, required: true },
    { name: "image",          label: "Book Cover",     type: "image",    colSpan: 2 },
  ]
}

// ─── Defaults ────────────────────────────────────────────

const EMPTY_DEFAULTS: FormValues = {
  title:          "",
  keywords:       "",
  category:       "",
  published_year: "",
  isbn:           "",
  call_number:    "",
  copies_total:   "",
  author:         "",
  publisher:      "",
  summary:        "",
  image:          null,
  imagePreview:   null,
}

// ─── Mapper ──────────────────────────────────────────────

function toPayload(values: FormValues): PhysicalBookFormData {
  const details: Record<string, unknown> = {}

  const toStr = (val: unknown): string | null => {
    if (val === null || val === undefined) return null
    return String(val)
  }

  if (values.publisher)      details.publisher      = toStr(values.publisher)
  if (values.published_year) details.published_year = toStr(values.published_year as unknown as number)
  if (values.summary)        details.description    = toStr(values.summary)
  if (values.call_number)    details.call_number    = toStr(values.call_number)

  return {
    title:        String(values.title ?? ""),
    keywords:     values.keywords     ? toStr(values.keywords)            : null,
    author:       values.author       ? toStr(values.author)              : null,
    isbn:         values.isbn         ? toStr(values.isbn)                : null,
    copies_total: values.copies_total ? Number(values.copies_total)       : null,
    category:     values.category     ? String(values.category)           : null,
    details:      Object.keys(details).length ? details                   : null,
    image:        values.image instanceof File ? values.image             : null,
  }
}

// ─── Component ───────────────────────────────────────────

export function PhysicalBookFormDialog({
  onSuccess,
  mode = "create",
  initialData,
  resourceId,
  open: controlledOpen,
  onOpenChange,
}: PhysicalBookFormDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  const open    = controlledOpen ?? internalOpen
  const setOpen = onOpenChange   ?? setInternalOpen

  const { create, isLoading: creating, error } = useCreatePhysicalBook()
  const { update, isLoading: updating }        = useUpdatePhysicalBook()

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

      category:
        initialData?.category !== null && initialData?.category !== undefined
          ? mode === "view"
            ? String(initialData.category_name)
            : String(initialData.category)
          : "",

      image: initialData?.image ?? initialData?.imagePreview ?? null,
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
            Add Book
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" && "Add Physical Book"}
            {mode === "update" && "Edit Physical Book"}
            {mode === "view"   && "View Physical Book"}
          </DialogTitle>

          <DialogDescription>
            {mode === "create" && "Fill in the details and save."}
            {mode === "update" && "Update the book information."}
            {mode === "view"   && "Viewing book details."}
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
              ? isLoading ? "Updating..." : "Update"
              : isLoading ? "Saving..."   : "Save"
          }
          mode={mode}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}