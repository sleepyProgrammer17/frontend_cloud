import { useState, useCallback } from "react";
import { AxiosError } from "axios";
import api from "@/lib/api";

// =========================================================
// Types
// =========================================================
export interface PhysicalBookCopy {
  id:          string;
  copy_number: number;
  status:      string;
  barcode:     string;
  book:        string;
  created_at:  string;
}

export interface PhysicalBookItem {
  id: number;
  title: string;
  author: string | null;
  isbn: string | null;
  keywords: string | null;
  copies_total: number | null;
  copies_available: number;
  copies: PhysicalBookCopy[];  
  times_borrowed: number;

  image: File | null;
  image_path: string | null;
  signed_image_url: string | null;

  category: number | null;
  category_name: string | null;

  details: Record<string, unknown> | null;

  created_at: string;
}

export interface PhysicalBookFormData {
  title: string;
  author?: string | null;
  isbn?: string | null;
  keywords?: string | null;
  copies_total?: number | null;
  category?: string | null;
  details?: Record<string, unknown> | null;
  image?: File | null;
}

export type PhysicalBookListResult =
  | { ok: true; data: PhysicalBookItem[] }
  | { ok: false; error: string };

export type PhysicalBookDetailResult =
  | { ok: true; data: PhysicalBookItem }
  | { ok: false; error: string };

export type PhysicalBookMutateResult =
  | { ok: true; data: PhysicalBookItem }
  | { ok: false; error: string };

export type PhysicalBookDeleteResult =
  | { ok: true }
  | { ok: false; error: string };

// =========================================================
// Helper — FormData builder
// =========================================================

function buildFormData(data: PhysicalBookFormData): FormData {
  const fd = new FormData();

  fd.append("title", data.title);

  if (data.author != null) fd.append("author", data.author);
  if (data.isbn != null) fd.append("isbn", data.isbn);
  if (data.keywords != null) fd.append("keywords", data.keywords);
  if (data.copies_total != null)
    fd.append("copies_total", String(data.copies_total));
  if (data.category != null) fd.append("category", String(data.category));
  if (data.details != null)
    fd.append("details", JSON.stringify(data.details));
  if (data.image != null) fd.append("image", data.image);

  return fd;
}

// =========================================================
// usePhysicalBookList
// =========================================================

export function usePhysicalBookList() {
  const [data, setData] = useState<PhysicalBookItem[] | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async (): Promise<PhysicalBookListResult> => {
    setLoading(true);
    setError(null);

    try {
      const { data: res } = await api.get<PhysicalBookItem[]>(
        "/physical-books/"
      );
      setData(res);
      return { ok: true, data: res };
    } catch (err) {
      const msg =
        (err as AxiosError<{ error?: string }>).response?.data?.error ??
        "Failed to fetch physical books.";
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, isLoading, error, fetchAll, clearError: () => setError(null) };
}

// =========================================================
// usePhysicalBookDetail
// =========================================================

export function usePhysicalBookDetail() {
  const [data, setData] = useState<PhysicalBookItem | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchById = useCallback(
    async (id: string): Promise<PhysicalBookDetailResult> => {
      setLoading(true);
      setError(null);

      try {
        const { data: res } = await api.get<PhysicalBookItem>(
          `/physical-books/${id}/`
        );
        setData(res);
        return { ok: true, data: res };
      } catch (err) {
        const msg =
          (err as AxiosError<{ error?: string }>).response?.data?.error ??
          "Failed to fetch book.";
        setError(msg);
        return { ok: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { data, isLoading, error, fetchById, clearError: () => setError(null) };
}

// =========================================================
// useCreatePhysicalBook
// =========================================================

export function useCreatePhysicalBook() {
  const [data, setData] = useState<PhysicalBookItem | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (formData: PhysicalBookFormData): Promise<PhysicalBookMutateResult> => {
      setLoading(true);
      setError(null);

      try {
        const { data: res } = await api.post<PhysicalBookItem>(
          "/physical-books/",
          buildFormData(formData),
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setData(res);
        return { ok: true, data: res };
      } catch (err) {
        const msg =
          (err as AxiosError<{ error?: string }>).response?.data?.error ??
          "Failed to create book.";
        setError(msg);
        return { ok: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { data, isLoading, error, create, clearError: () => setError(null) };
}

// =========================================================
// useUpdatePhysicalBook
// =========================================================

export function useUpdatePhysicalBook() {
  const [data, setData] = useState<PhysicalBookItem | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(
    async (
      id: string,
      formData: Partial<PhysicalBookFormData>
    ): Promise<PhysicalBookMutateResult> => {
      setLoading(true);
      setError(null);

      try {
        const fd = new FormData();

        if (formData.title != null) fd.append("title", formData.title);
        if (formData.author != null) fd.append("author", formData.author);
        if (formData.isbn != null) fd.append("isbn", formData.isbn);
        if (formData.keywords != null) fd.append("keywords", formData.keywords);
        if (formData.copies_total != null)
          fd.append("copies_total", String(formData.copies_total));
        if (formData.category != null)
          fd.append("category", String(formData.category));
        if (formData.details != null)
          fd.append("details", JSON.stringify(formData.details));
        if (formData.image != null) fd.append("image", formData.image);

        const { data: res } = await api.patch<PhysicalBookItem>(
          `/physical-books/${id}/`,
          fd,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        setData(res);
        return { ok: true, data: res };
      } catch (err) {
        const msg =
          (err as AxiosError<{ error?: string }>).response?.data?.error ??
          "Failed to update book.";
        setError(msg);
        return { ok: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { data, isLoading, error, update, clearError: () => setError(null) };
}

// =========================================================
// useDeletePhysicalBook
// =========================================================

export function useDeletePhysicalBook() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = useCallback(
    async (id: string): Promise<PhysicalBookDeleteResult> => {
      setLoading(true);
      setError(null);

      try {
        await api.delete(`/physical-books/${id}/`);
        return { ok: true };
      } catch (err) {
        const msg =
          (err as AxiosError<{ error?: string }>).response?.data?.error ??
          "Failed to delete book.";
        setError(msg);
        return { ok: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { isLoading, error, remove, clearError: () => setError(null) };
}

// =========================================================
// usePhysicalBookSearch
// =========================================================

export interface PhysicalBookSearchParams {
  query?: string;
  category?: string;
  page?: number;
}

export interface PhysicalBookSearchResponse {
  page: number;
  page_size: number;
  total: number;
  results: PhysicalBookItem[];
}

export function usePhysicalBookSearch() {
  const [data, setData] = useState<PhysicalBookSearchResponse | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (
      params: PhysicalBookSearchParams
    ): Promise<
      | { ok: true; data: PhysicalBookSearchResponse }
      | { ok: false; error: string }
    > => {
      setLoading(true);
      setError(null);

      try {
        const { data: res } = await api.post<PhysicalBookSearchResponse>(
          "/physical-books/search/",
          {
            query: params.query ?? "",
            category: params.category ?? null,
            page: params.page ?? 1,
          }
        );
        setData(res);
        return { ok: true, data: res };
      } catch (err) {
        const msg =
          (err as AxiosError<{ error?: string }>).response?.data?.error ??
          "Search failed.";
        setError(msg);
        return { ok: false, error: msg };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { data, isLoading, error, search, clearError: () => setError(null) };
}