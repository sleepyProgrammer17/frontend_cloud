"use client"

import { useState, useCallback } from "react"
import { AxiosError } from "axios"
import api from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Lightbulb, Loader2 } from "lucide-react"

// =========================================================
// Types
// =========================================================

export interface Category {
  id: string
  name: string
}

export interface BookSuggestionItem {
  id: string
  requested_by: string
  title: string
  author: string
  category: string | null
  reason: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
}

export interface SuggestionPayload {
  title: string
  author: string
  category?: string
  reason?: string
}

export interface SuggestionUpdateData {
  title?: string
  author?: string
  category?: string | null
  reason?: string
  status?: "pending" | "approved" | "rejected"
}

export type BookSuggestionListResult =
  | { ok: true; data: BookSuggestionItem[] }
  | { ok: false; error: string }

export type BookSuggestionMutateResult =
  | { ok: true; data: BookSuggestionItem }
  | { ok: false; error: string }

export type BookSuggestionDeleteResult =
  | { ok: true }
  | { ok: false; error: string }

// =========================================================
// useBookSuggestionList  —  GET /suggestions/
// =========================================================

export function useBookSuggestionList() {
  const [data,      setData]    = useState<BookSuggestionItem[] | null>(null)
  const [isLoading, setLoading] = useState(false)
  const [error,     setError]   = useState<string | null>(null)

  const fetchAll = useCallback(async (): Promise<BookSuggestionListResult> => {
    setLoading(true)
    setError(null)
    try {
      const { data: res } = await api.get<BookSuggestionItem[]>("/suggestions/")
      setData(res)
      return { ok: true, data: res }
    } catch (err) {
      const msg =
        (err as AxiosError<{ error?: string }>).response?.data?.error ??
        "Failed to fetch suggestions."
      setError(msg)
      return { ok: false, error: msg }
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, isLoading, error, fetchAll, clearError: () => setError(null) }
}

// =========================================================
// useCreateBookSuggestion  —  POST /suggestions/
// =========================================================

export function useCreateBookSuggestion() {
  const [data,      setData]    = useState<BookSuggestionItem | null>(null)
  const [isLoading, setLoading] = useState(false)
  const [error,     setError]   = useState<string | null>(null)

  const create = useCallback(
    async (payload: SuggestionPayload): Promise<BookSuggestionMutateResult> => {
      setLoading(true)
      setError(null)
      try {
        const { data: res } = await api.post<BookSuggestionItem>(
          "/suggestions/",
          payload
        )
        setData(res)
        return { ok: true, data: res }
      } catch (err) {
        const msg =
          (err as AxiosError<{ error?: string }>).response?.data?.error ??
          "Failed to submit suggestion."
        setError(msg)
        return { ok: false, error: msg }
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { data, isLoading, error, create, clearError: () => setError(null) }
}

// =========================================================
// useUpdateBookSuggestion  —  PATCH /suggestions/:id/
// =========================================================

export function useUpdateBookSuggestion() {
  const [data,      setData]    = useState<BookSuggestionItem | null>(null)
  const [isLoading, setLoading] = useState(false)
  const [error,     setError]   = useState<string | null>(null)

  const update = useCallback(
    async (
      id: string,
      payload: SuggestionUpdateData
    ): Promise<BookSuggestionMutateResult> => {
      setLoading(true)
      setError(null)
      try {
        const { data: res } = await api.patch<BookSuggestionItem>(
          `/suggestions/${id}/`,
          payload
        )
        setData(res)
        return { ok: true, data: res }
      } catch (err) {
        const msg =
          (err as AxiosError<{ error?: string }>).response?.data?.error ??
          "Failed to update suggestion."
        setError(msg)
        return { ok: false, error: msg }
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { data, isLoading, error, update, clearError: () => setError(null) }
}

// =========================================================
// useDeleteBookSuggestion  —  DELETE /suggestions/:id/
// =========================================================

export function useDeleteBookSuggestion() {
  const [isLoading, setLoading] = useState(false)
  const [error,     setError]   = useState<string | null>(null)

  const remove = useCallback(
    async (id: string): Promise<BookSuggestionDeleteResult> => {
      setLoading(true)
      setError(null)
      try {
        await api.delete(`/suggestions/${id}/`)
        return { ok: true }
      } catch (err) {
        const msg =
          (err as AxiosError<{ error?: string }>).response?.data?.error ??
          "Failed to delete suggestion."
        setError(msg)
        return { ok: false, error: msg }
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { isLoading, error, remove, clearError: () => setError(null) }
}

// =========================================================
// Dialog Props
// =========================================================

interface BookSuggestionDialogProps {
  open: boolean
  isSubmitting: boolean
  categories?: Category[]
  onClose: () => void
  onConfirm: (payload: SuggestionPayload) => void
}

// =========================================================
// BookSuggestionDialog
// =========================================================

export function BookSuggestionDialog({
  open,
  isSubmitting,
  categories = [],
  onClose,
  onConfirm,
}: BookSuggestionDialogProps) {

  // ── form state ────────────────────────────────────────────────────────────
  const [title,    setTitle]    = useState<string>("")
  const [author,   setAuthor]   = useState<string>("")
  const [category, setCategory] = useState<string>("")
  const [reason,   setReason]   = useState<string>("")

  // ── form helpers ──────────────────────────────────────────────────────────

  const reset = () => {
    setTitle("")
    setAuthor("")
    setCategory("")
    setReason("")
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleConfirm = () => {
    if (!title.trim() || !author.trim()) return
    onConfirm({
      title:    title.trim(),
      author:   author.trim(),
      category: category || undefined,
      reason:   reason.trim() || undefined,
    })
  }

  const isValid = title.trim() !== "" && author.trim() !== ""

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="size-4 text-primary" />
            Suggest a Book
          </DialogTitle>
          <DialogDescription>
            Know a book we should add to the library? Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">

          {/* ── Title ────────────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <Label htmlFor="suggestion-title" className="text-sm font-medium">
              Book title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="suggestion-title"
              placeholder="e.g. Clean Code"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
            />
          </div>

          {/* ── Author ───────────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <Label htmlFor="suggestion-author" className="text-sm font-medium">
              Author <span className="text-destructive">*</span>
            </Label>
            <Input
              id="suggestion-author"
              placeholder="e.g. Robert C. Martin"
              value={author}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthor(e.target.value)}
            />
          </div>

          {/* ── Category ─────────────────────────────────────────────────── */}
          {categories.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Category{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full cursor-pointer">
                  <SelectValue placeholder="Select a category…" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

    
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting || !isValid}
            className="gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Lightbulb className="size-3.5" />
            )}
            Submit suggestion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}