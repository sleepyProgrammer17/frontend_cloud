"use client"

import { useState, useCallback } from "react";
import { AxiosError } from "axios";
import api from "@/lib/api";

// =========================================================
// Types
// =========================================================

export interface BorrowedBookItem {
  id: string;
  user: string;
  copy: string;
  book_title: string;
  book_author: string;
  overdue_setting: string | null;
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
  status: string;
  is_damaged: boolean;
  total_fee: string;
  is_paid: boolean;
  paid_at: string | null;
  remarks: string;
}

export interface BorrowedBookUpdateData {
  due_date?: string;
  returned_at?: string | null;
  status?: string;
  is_damaged?: boolean;
  total_fee?: string;
  is_paid?: boolean;
  paid_at?: string | null;
  remarks?: string;
}

export interface ReturnPayload {
  status: "returned" | "lost";
  returned_at: string | null;
  is_damaged: boolean;
  remarks?: string;
}

export interface BorrowPayload {
  copy: string;
  user?: string;
  due_date: string;
  overdue_setting?: string;
  status: "pending" | "borrowed";
  is_damaged: boolean;
  remarks?: string;
}

export type BorrowedBookListResult =
  | { ok: true; data: BorrowedBookItem[] }
  | { ok: false; error: string };

export type BorrowedBookMutateResult =
  | { ok: true; data: BorrowedBookItem }
  | { ok: false; error: string };

// =========================================================
// Helper — parse any DRF error shape into a readable string
// =========================================================

type DRFErrorBody = Record<string, unknown>;

function parseDRFError(err: unknown, fallback: string): string {
  const body = (err as AxiosError<DRFErrorBody>).response?.data;
  if (!body) return fallback;

  // { detail: "..." }  ← most DRF auth / permission errors
  if (typeof body.detail === "string") return body.detail;

  // { error: "..." }   ← custom API errors
  if (typeof body.error === "string") return body.error;

  // { non_field_errors: ["..."] }
  if (Array.isArray(body.non_field_errors) && body.non_field_errors.length > 0)
    return String(body.non_field_errors[0]);

  // Field-level errors: { copy: ["Invalid pk..."], due_date: ["..."] }
  const fieldMessages = Object.entries(body)
    .flatMap(([field, val]) => {
      const msgs = Array.isArray(val) ? val : [val];
      return msgs.map((m) => `${field}: ${m}`);
    })
    .join(" | ");

  return fieldMessages || fallback;
}

// =========================================================
// useBorrowedBookList  —  GET /borrowed-books/
// =========================================================

export function useBorrowedBookList() {
  const [data,      setData]    = useState<BorrowedBookItem[] | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error,     setError]   = useState<string | null>(null);

  const fetchAll = useCallback(async (): Promise<BorrowedBookListResult> => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await api.get<BorrowedBookItem[]>("/borrowed-books/");
      setData(res);
      return { ok: true, data: res };
    } catch (err) {
      const msg = parseDRFError(err, "Failed to fetch borrowed books.");
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, isLoading, error, fetchAll, clearError: () => setError(null) };
}

// =========================================================
// useCreateBorrowedBook  —  POST /borrowed-books/
// =========================================================

export function useCreateBorrowedBook() {
  const [data,      setData]    = useState<BorrowedBookItem | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error,     setError]   = useState<string | null>(null);

  const create = useCallback(
    async (payload: BorrowPayload): Promise<BorrowedBookMutateResult> => {
      setLoading(true);
      setError(null);
      try {
        const { data: res } = await api.post<BorrowedBookItem>(
          "/borrowed-books/",
          payload
        );
        setData(res);
        return { ok: true, data: res };
      } catch (err) {
        const msg = parseDRFError(err, "Failed to create borrow record.");
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
// useUpdateBorrowedBook  —  PATCH /borrowed-books/:id/
// =========================================================

export function useUpdateBorrowedBook() {
  const [data,      setData]    = useState<BorrowedBookItem | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error,     setError]   = useState<string | null>(null);

  const update = useCallback(
    async (
      id: string,
      payload: BorrowedBookUpdateData | ReturnPayload
    ): Promise<BorrowedBookMutateResult> => {
      setLoading(true);
      setError(null);
      try {
        const { data: res } = await api.patch<BorrowedBookItem>(
          `/borrowed-books/${id}/`,
          payload
        );
        setData(res);
        return { ok: true, data: res };
      } catch (err) {
        const msg = parseDRFError(err, "Failed to update borrowed book.");
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