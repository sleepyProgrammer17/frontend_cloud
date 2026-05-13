import { useState, useCallback } from "react";
import { AxiosError } from "axios";
import api from "@/lib/api";

// =========================================================
// Types
// =========================================================

export interface DigitalResourceItem {
  id: number;
  title: string;
  author: string | null;
  type: string | null;
  keywords: string | null;
  published_year: number | null;

  image_path: string | null;
  file_path: string | null;

  // ✅ signed URLs returned by the backend
  signed_image_url: string | null;
  signed_file_url: string | null;

  // ✅ view/read counter
  times_read: number;

  category: number | null;
  category_name: string | null;

  details: Record<string, unknown> | null;

  created_at: string;
}

export interface DigitalResourceFormData {
  title: string;
  author?: string | null;
  type?: string | null;
  keywords?: string | null;
  published_year?: number | null;
  category?: string | null;
  details?: Record<string, unknown>;

  image?: File | null;
  file?: File | null;
}

export type DigitalListResult =
  | { ok: true; data: DigitalResourceItem[] }
  | { ok: false; error: string };

export type DigitalDetailResult =
  | { ok: true; data: DigitalResourceItem }
  | { ok: false; error: string };

export type DigitalMutateResult =
  | { ok: true; data: DigitalResourceItem }
  | { ok: false; error: string };

export type DigitalDeleteResult =
  | { ok: true }
  | { ok: false; error: string };

// =========================================================
// Helper — FormData builder
// =========================================================

function buildFormData(data: DigitalResourceFormData): FormData {
  const fd = new FormData();

  fd.append("title", data.title);

  if (data.author != null) fd.append("author", data.author);
  if (data.type != null) fd.append("type", data.type);
  if (data.keywords != null) fd.append("keywords", data.keywords);
  if (data.published_year != null)
    fd.append("published_year", String(data.published_year));
  if (data.category != null) fd.append("category", String(data.category));
  if (data.details != null)
    fd.append("details", JSON.stringify(data.details));

  if (data.image != null) fd.append("image", data.image);
  if (data.file != null) fd.append("file", data.file);

  return fd;
}

// =========================================================
// useDigitalList
// =========================================================

export function useDigitalList() {
  const [data, setData] = useState<DigitalResourceItem[] | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async (): Promise<DigitalListResult> => {
    setLoading(true);
    setError(null);

    try {
      const { data: res } = await api.get<DigitalResourceItem[]>(
        "/digital-resources/"
      );
      setData(res);
      return { ok: true, data: res };
    } catch (err) {
      const msg =
        (err as AxiosError<{ error?: string }>).response?.data?.error ??
        "Failed to fetch digital resources.";
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, isLoading, error, fetchAll, clearError: () => setError(null) };
}

// =========================================================
// useDigitalDetail
// =========================================================

export function useDigitalDetail() {
  const [data, setData] = useState<DigitalResourceItem | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchById = useCallback(
    async (id: string): Promise<DigitalDetailResult> => {
      setLoading(true);
      setError(null);

      try {
        const { data: res } = await api.get<DigitalResourceItem>(
          `/digital-resources/${id}/`
        );
        setData(res);
        return { ok: true, data: res };
      } catch (err) {
        const msg =
          (err as AxiosError<{ error?: string }>).response?.data?.error ??
          "Failed to fetch resource.";
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
// useCreateDigital
// =========================================================

export function useCreateDigital() {
  const [data, setData] = useState<DigitalResourceItem | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (formData: DigitalResourceFormData): Promise<DigitalMutateResult> => {
      setLoading(true);
      setError(null);

      try {
        const { data: res } = await api.post<DigitalResourceItem>(
          "/digital-resources/",
          buildFormData(formData),
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        setData(res);
        return { ok: true, data: res };
      } catch (err) {
        const msg =
          (err as AxiosError<{ error?: string }>).response?.data?.error ??
          "Failed to create resource.";
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
// useUpdateDigital
// =========================================================

export function useUpdateDigital() {
  const [data, setData] = useState<DigitalResourceItem | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(
    async (
      id: string,
      formData: Partial<DigitalResourceFormData>
    ): Promise<DigitalMutateResult> => {
      setLoading(true);
      setError(null);

      try {
        const fd = new FormData();

        if (formData.title != null) fd.append("title", formData.title);
        if (formData.author != null) fd.append("author", formData.author);
        if (formData.type != null) fd.append("type", formData.type);
        if (formData.keywords != null)
          fd.append("keywords", formData.keywords);
        if (formData.published_year != null)
          fd.append("published_year", String(formData.published_year));
        if (formData.category != null)
          fd.append("category", String(formData.category));
        if (formData.details != null)
          fd.append("details", JSON.stringify(formData.details));

        if (formData.image != null) fd.append("image", formData.image);
        if (formData.file != null) fd.append("file", formData.file);

        const { data: res } = await api.patch<DigitalResourceItem>(
          `/digital-resources/${id}/`,
          fd,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        setData(res);
        return { ok: true, data: res };
      } catch (err) {
        const msg =
          (err as AxiosError<{ error?: string }>).response?.data?.error ??
          "Failed to update resource.";
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
// useDeleteDigital
// =========================================================

export function useDeleteDigital() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = useCallback(
    async (id: string): Promise<DigitalDeleteResult> => {
      setLoading(true);
      setError(null);

      try {
        await api.delete(`/digital-resources/${id}/`);
        return { ok: true };
      } catch (err) {
        const msg =
          (err as AxiosError<{ error?: string }>).response?.data?.error ??
          "Failed to delete resource.";
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
// useDigitalSearch (semantic search)
// =========================================================
export interface DigitalSearchParams {
  query?: string;
  category?: string;
  page?: number;
}

export interface DigitalSearchResponse {
  page: number;
  page_size: number;
  total: number;
  results: DigitalResourceItem[];
}

export function useDigitalSearch() {
  const [data, setData] = useState<DigitalSearchResponse | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(
    async (params: DigitalSearchParams): Promise<
      | { ok: true; data: DigitalSearchResponse }
      | { ok: false; error: string }
    > => {
      setLoading(true);
      setError(null);

      try {
        const { data: res } = await api.post<DigitalSearchResponse>(
          "/digital-resources/search/",
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

  return {
    data,
    isLoading,
    error,
    search,
    clearError: () => setError(null),
  };
}







// =========================================================
// useIncrementResourcesRead
// =========================================================

export function useIncrementResourcesRead() {
  const [isLoading, setLoading] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const incrementView = useCallback(
    async (id: string): Promise<{ ok: true; times_viewed: number } | { ok: false; error: string }> => {
      setLoading(true)
      setError(null)

      try {
        const { data: res } = await api.patch<{ times_viewed: number }>(
          `/digital-resources/${id}/read/`,
          {},
        )
        return { ok: true, times_viewed: res.times_viewed }
      } catch (err) {
        const msg = (err as AxiosError<{ error?: string }>).response?.data?.error ?? "Failed to increment view."
        setError(msg)
        return { ok: false, error: msg }
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return { isLoading, error, incrementView, clearError: () => setError(null) }
}