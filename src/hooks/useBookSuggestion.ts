"use client"

import { useState, useCallback } from "react";
import { AxiosError } from "axios";
import api from "@/lib/api";

// =========================================================
// Types
// =========================================================

export interface BookSuggestionItem {
  id: string;
  requested_by: number;
  requested_by_username: string;
  approved_by: number | null;
  approved_by_username: string | null;
  title: string;
  author: string;
  status: "pending" | "approved" | "rejected";
  approved_at: string | null;
  created_at: string;
}

export interface SuggestionPayload {
  title: string;
  author: string;
}

export interface SuggestionUpdateData {
  title?: string;
  author?: string;
  status?: "pending" | "approved" | "rejected";
}

export type BookSuggestionListResult =
  | { ok: true; data: BookSuggestionItem[] }
  | { ok: false; error: string };

export type BookSuggestionMutateResult =
  | { ok: true; data: BookSuggestionItem }
  | { ok: false; error: string };

export type BookSuggestionDeleteResult =
  | { ok: true }
  | { ok: false; error: string };

// =========================================================
// useBookSuggestionList  —  GET /book-suggestions/
// =========================================================

export function useBookSuggestionList() {
  const [data,      setData]    = useState<BookSuggestionItem[] | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error,     setError]   = useState<string | null>(null);

  const fetchAll = useCallback(async (): Promise<BookSuggestionListResult> => {
    setLoading(true);
    setError(null);
    try {
      const { data: res } = await api.get<BookSuggestionItem[]>("/book-suggestions/");
      setData(res);
      return { ok: true, data: res };
    } catch (err) {
      const msg =
        (err as AxiosError<{ error?: string }>).response?.data?.error ??
        "Failed to fetch book suggestions.";
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, isLoading, error, fetchAll, clearError: () => setError(null) };
}

// =========================================================
// useCreateBookSuggestion  —  POST /book-suggestions/
// =========================================================

export function useCreateBookSuggestion() {
  const [data,      setData]    = useState<BookSuggestionItem | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error,     setError]   = useState<string | null>(null);

  const create = useCallback(
    async (payload: SuggestionPayload): Promise<BookSuggestionMutateResult> => {
      setLoading(true);
      setError(null);
      try {
        const { data: res } = await api.post<BookSuggestionItem>(
          "/book-suggestions/",
          payload
        );
        setData(res);
        return { ok: true, data: res };
      } catch (err) {
        const msg =
          (err as AxiosError<{ error?: string }>).response?.data?.error ??
          "Failed to submit suggestion.";
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
// useUpdateBookSuggestion  —  PATCH /book-suggestions/:id/
// =========================================================

export function useUpdateBookSuggestion() {
  const [data,      setData]    = useState<BookSuggestionItem | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error,     setError]   = useState<string | null>(null);

  const update = useCallback(
    async (
      id: string,
      payload: SuggestionUpdateData
    ): Promise<BookSuggestionMutateResult> => {
      setLoading(true);
      setError(null);
      try {
        const { data: res } = await api.patch<BookSuggestionItem>(
          `/book-suggestions/${id}/`,
          payload
        );
        setData(res);
        return { ok: true, data: res };
      } catch (err) {
        const msg =
          (err as AxiosError<{ error?: string }>).response?.data?.error ??
          "Failed to update suggestion.";
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
// useDeleteBookSuggestion  —  DELETE /book-suggestions/:id/
// =========================================================

export function useDeleteBookSuggestion() {
  const [isLoading, setLoading] = useState(false);
  const [error,     setError]   = useState<string | null>(null);

  const remove = useCallback(
    async (id: string): Promise<BookSuggestionDeleteResult> => {
      setLoading(true);
      setError(null);
      try {
        await api.delete(`/book-suggestions/${id}/`);
        return { ok: true };
      } catch (err) {
        const msg =
          (err as AxiosError<{ error?: string }>).response?.data?.error ??
          "Failed to delete suggestion.";
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


export function useApprovedIncomingBooks() {
  const [data, setData] = useState<BookSuggestionItem[] | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApproved = useCallback(
    async (): Promise<BookSuggestionListResult> => {
      setLoading(true);
      setError(null);

      try {
        const { data: res } = await api.get<BookSuggestionItem[]>(
          "/book-suggestions/?status=approved"
        );

        setData(res);

        return {
          ok: true,
          data: res,
        };
      } catch (err) {
        const msg =
          (err as AxiosError<{ error?: string }>).response?.data?.error ??
          "Failed to fetch approved incoming books.";

        setError(msg);

        return {
          ok: false,
          error: msg,
        };
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
    fetchApproved,
    clearError: () => setError(null),
  };
}