// hooks/useResearch.ts

import { useState, useCallback } from "react";
import  { AxiosError } from "axios";
import api from "@/lib/api";  // shared instance
// =========================================================
// Types
// =========================================================

export interface ResearchItem {
  id: number;
  title: string;
  keywords: string | null;
  file_path: string | null;
  signed_file_url: string | null;
  uploaded_by: number | null;
  uploaded_by_username: string | null;
  category: number | null;
  category_name: string | null;
  department: number | null;
  department_name: string | null;
  details: Record<string, unknown> | null;
  times_viewed: number;
  created_at: string;
}

export interface ResearchFormData {
  title: string;
  keywords?: string | null;
  category?: string | null;
  department?: string | null;
  details?: Record<string, unknown>;
  file?: File | null;
}

export type ResearchListResult =
  | { ok: true; data: ResearchItem[] }
  | { ok: false; error: string };

export type ResearchDetailResult =
  | { ok: true; data: ResearchItem }
  | { ok: false; error: string };

export type ResearchMutateResult =
  | { ok: true; data: ResearchItem }
  | { ok: false; error: string };

export type ResearchDeleteResult =
  | { ok: true }
  | { ok: false; error: string };

// =========================================================
// Axios instance (reuse same config as useAuth)
// =========================================================


// =========================================================
// Helper — build FormData from ResearchFormData
// =========================================================

function buildFormData(data: ResearchFormData): FormData {
  const fd = new FormData();
  fd.append("title", data.title);
  if (data.keywords   != null) fd.append("keywords",   data.keywords);
  if (data.category   != null) fd.append("category",   String(data.category));
  if (data.department != null) fd.append("department", String(data.department));
  if (data.details    != null) fd.append("details",    JSON.stringify(data.details));
  if (data.file       != null) fd.append("file",       data.file);
  return fd;
}

// =========================================================
// useResearchList
// =========================================================

export function useResearchList() {
  const [data, setData]         = useState<ResearchItem[] | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const fetchAll = useCallback(async (): Promise<ResearchListResult> => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await api.get<ResearchItem[]>("/research-repositories/");
      setData(res);
      return { ok: true, data: res };
    } catch (err) {
      const msg = (err as AxiosError<{ error?: string }>).response?.data?.error ?? "Failed to fetch research list.";
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, isLoading, error, fetchAll, clearError: () => setError(null) };
}

// =========================================================
// useResearchDetail
// =========================================================

export function useResearchDetail() {
  const [data, setData]         = useState<ResearchItem | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const fetchbydepartment = useCallback(async (id: string): Promise<ResearchDetailResult> => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await api.get<ResearchItem>(`/research-repositories/${id}/`);
      setData(res);
      return { ok: true, data: res };
    } catch (err) {
      const msg = (err as AxiosError<{ error?: string }>).response?.data?.error ?? "Failed to fetch research.";
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, isLoading, error, fetchbydepartment, clearError: () => setError(null) };
}

// =========================================================
// useCreateResearch
// =========================================================

export function useCreateResearch() {
  const [data, setData]         = useState<ResearchItem | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const create = useCallback(async (formData: ResearchFormData): Promise<ResearchMutateResult> => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await api.post<ResearchItem>(
        "/research-repositories/",
        buildFormData(formData),
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setData(res);
      return { ok: true, data: res };
    } catch (err) {
      const msg = (err as AxiosError<{ error?: string }>).response?.data?.error ?? "Failed to create research.";
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, isLoading, error, create, clearError: () => setError(null) };
}

// =========================================================
// useUpdateResearch
// =========================================================

export function useUpdateResearch() {
  const [data, setData]         = useState<ResearchItem | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const update = useCallback(async (
    id: string,
    formData: Partial<ResearchFormData>
  ): Promise<ResearchMutateResult> => {
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      if (formData.title      != null) fd.append("title",      formData.title);
      if (formData.keywords   != null) fd.append("keywords",   formData.keywords);
      if (formData.category   != null) fd.append("category",   String(formData.category));
      if (formData.department != null) fd.append("department", String(formData.department));
      if (formData.details    != null) fd.append("details",    JSON.stringify(formData.details));
      if (formData.file       != null) fd.append("file",       formData.file);

      const { data: res } = await api.patch<ResearchItem>(
        `/research-repositories/${id}/`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setData(res);
      return { ok: true, data: res };
    } catch (err) {
      const msg = (err as AxiosError<{ error?: string }>).response?.data?.error ?? "Failed to update research.";
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, isLoading, error, update, clearError: () => setError(null) };
}

// =========================================================
// useDeleteResearch
// =========================================================

export function useDeleteResearch() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const remove = useCallback(async (id: string): Promise<ResearchDeleteResult> => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/research-repositories/${id}/`);
      return { ok: true };
    } catch (err) {
      const msg = (err as AxiosError<{ error?: string }>).response?.data?.error ?? "Failed to delete research.";
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { isLoading, error, remove, clearError: () => setError(null) };
}

// =========================================================
// useResearchSearch  (semantic search)
// =========================================================
interface ResearchSearchResponse {
  page: number;
  page_size: number;
  total: number;
  results: ResearchItem[];
}

export function useResearchSearch() {
  const [data, setData]         = useState<ResearchItem[] | null>(null);
  const [total, setTotal]       = useState<number>(0);
  const [page, setPage]         = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const search = useCallback(async ({
    query,
    category,
    page = 1,
  }: {
    query?: string;
    category?: string;
    page?: number;
  }): Promise<ResearchListResult> => {

    setLoading(true);
    setError(null);

    try {
      const { data: res } = await api.post<ResearchSearchResponse>(
        "/research-repositories/search/",
        {
          query: query || null,
          category: category || null,
          page,
        }
      );

      setData(res.results);
      setTotal(res.total);
      setPage(res.page);
      setPageSize(res.page_size);

      return { ok: true, data: res.results };

    } catch (err) {
      const msg =
        (err as AxiosError<{ error?: string }>).response?.data?.error ??
        "Search failed.";

      setError(msg);
      return { ok: false, error: msg };

    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    total,
    page,
    pageSize,
    isLoading,
    error,
    search,
    clearError: () => setError(null),
  };
}

// =========================================================
// useIncrementResearchView
// =========================================================

export function useIncrementResearchView() {
  const [isLoading, setLoading] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const incrementView = useCallback(
    async (id: string): Promise<{ ok: true; times_viewed: number } | { ok: false; error: string }> => {
      setLoading(true)
      setError(null)

      try {
        const { data: res } = await api.patch<{ times_viewed: number }>(
          `/research-repositories/${id}/view/`,
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