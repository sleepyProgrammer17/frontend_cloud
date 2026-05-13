import { useState, useCallback } from "react";
import { AxiosError } from "axios";
import api from "@/lib/api";

// =========================================================
// Types
// =========================================================

export interface DepartmentItem {
  id: number;
  name: string;
}

export interface DepartmentFormData {
  name: string;
}

export type DepartmentListResult =
  | { ok: true; data: DepartmentItem[] }
  | { ok: false; error: string };

export type DepartmentMutateResult =
  | { ok: true; data: DepartmentItem }
  | { ok: false; error: string };

export type DepartmentDeleteResult =
  | { ok: true }
  | { ok: false; error: string };

// =========================================================
// useDepartmentList
// =========================================================

export function useDepartmentList() {
  const [data, setData] = useState<DepartmentItem[] | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async (): Promise<DepartmentListResult> => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await api.get<DepartmentItem[]>("/departments/");
      setData(res);
      return { ok: true, data: res };
    } catch (err) {
      const msg =
        (err as AxiosError<{ error?: string }>).response?.data?.error ??
        "Failed to fetch departments.";
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, isLoading, error, fetchAll, clearError: () => setError(null) };
}

// =========================================================
// useCreateDepartment
// =========================================================

export function useCreateDepartment() {
  const [data, setData] = useState<DepartmentItem | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (formData: DepartmentFormData): Promise<DepartmentMutateResult> => {
      setLoading(true);
      setError(null);
      try {
        const { data: res } = await api.post<DepartmentItem>(
          "/departments/",
          formData
        );
        setData(res);
        return { ok: true, data: res };
      } catch (err) {
        const msg =
          (err as AxiosError<{ error?: string }>).response?.data?.error ??
          "Failed to create department.";
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
// useUpdateDepartment
// =========================================================

export function useUpdateDepartment() {
  const [data, setData] = useState<DepartmentItem | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(
    async (id: number, formData: Partial<DepartmentFormData>): Promise<DepartmentMutateResult> => {
      setLoading(true);
      setError(null);
      try {
        const { data: res } = await api.patch<DepartmentItem>(
          `/departments/${id}/`,
          formData
        );
        setData(res);
        return { ok: true, data: res };
      } catch (err) {
        const msg =
          (err as AxiosError<{ error?: string }>).response?.data?.error ??
          "Failed to update department.";
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
// useDeleteDepartment
// =========================================================

export function useDeleteDepartment() {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = useCallback(
    async (id: number): Promise<DepartmentDeleteResult> => {
      setLoading(true);
      setError(null);
      try {
        await api.delete(`/departments/${id}/`);
        return { ok: true };
      } catch (err) {
        const msg =
          (err as AxiosError<{ error?: string }>).response?.data?.error ??
          "Failed to delete department.";
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