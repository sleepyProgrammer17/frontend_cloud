import { useState, useCallback } from "react";
import { AxiosError } from "axios";
import api from "@/lib/api";

// =========================================================
// Types
// =========================================================

export interface CategoryItem {
  id: number;
  name: string;
}

export interface CategoryFormData {
  name: string;
}

export type CategoryListResult =
  | { ok: true; data: CategoryItem[] }
  | { ok: false; error: string };

export type CategoryMutateResult =
  | { ok: true; data: CategoryItem }
  | { ok: false; error: string };

export type CategoryDeleteResult =
  | { ok: true }
  | { ok: false; error: string };

// =========================================================
// useCategoryList
// =========================================================

export function useCategoryList() {
  const [data, setData] = useState<CategoryItem[] | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async (): Promise<CategoryListResult> => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await api.get<CategoryItem[]>("/category/");
      setData(res);
      return { ok: true, data: res };
    } catch (err) {
      const msg =
        (err as AxiosError<{ error?: string }>).response?.data?.error ??
        "Failed to fetch category.";
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, isLoading, error, fetchAll, clearError: () => setError(null) };
}

// =========================================================
// useCreateCategory
// =========================================================

export function useCreateCategory() {
  const [data, setData] = useState<CategoryItem | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (formData: CategoryFormData): Promise<CategoryMutateResult> => {
      setLoading(true);
      setError(null);
      try {
        const { data: res } = await api.post<CategoryItem>(
          "/category/",
          formData
        );
        setData(res);
        return { ok: true, data: res };
      } catch (err) {
        const msg =
          (err as AxiosError<{ error?: string }>).response?.data?.error ??
          "Failed to create category.";
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
// useUpdateCategory
// =========================================================

export function useUpdateCategory() {
  const [data, setData] = useState<CategoryItem | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(
    async (id: number, formData: Partial<CategoryFormData>): Promise<CategoryMutateResult> => {
      setLoading(true);
      setError(null);
      try {
        const { data: res } = await api.patch<CategoryItem>(
          `/category/${id}/`,
          formData
        );
        setData(res);
        return { ok: true, data: res };
      } catch (err) {
        const msg =
          (err as AxiosError<{ error?: string }>).response?.data?.error ??
          "Failed to update category.";
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
// useDeleteCategory
// =========================================================

export function useDeleteCategory() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = useCallback(
    async (id: number): Promise<CategoryDeleteResult> => {
      setLoading(true);
      setError(null);
      try {
        await api.delete(`/category/${id}/`);
        return { ok: true };
      } catch (err) {
        const msg =
          (err as AxiosError<{ error?: string }>).response?.data?.error ??
          "Failed to delete category.";
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