"use client";

import { useEffect } from "react";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useApprovedIncomingBooks } from "@/hooks/useBookSuggestion";
import { Button } from "@/components/ui/button";

// ─── Community CTA ─────────────────────────────────────────────────────────────

interface CommunityCTAProps {
  onJoin?: () => void;
}

export function CommunityCTA({ onJoin }: CommunityCTAProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-emerald-600 p-5 text-white shadow-md">
      <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-emerald-500/40 pointer-events-none" />
      <div className="absolute -bottom-8 -left-4 h-28 w-28 rounded-full bg-emerald-700/40 pointer-events-none" />
      <div className="relative">
        <h2 className="text-lg font-extrabold leading-snug mb-4">
          Join our book lovers community here now
        </h2>
        <Button
          size="sm"
          onClick={onJoin}
          className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold text-xs h-8 px-5 rounded-full shadow"
        >
          Join Now
        </Button>
      </div>
    </div>
  );
}

// ─── Incoming Books ─────────────────────────────────────────────────────────────

const FALLBACK_COVER = "/image.png";

export function IncomingBooks() {
  const { data, isLoading, fetchApproved } = useApprovedIncomingBooks();

  useEffect(() => {
    fetchApproved();
  }, [fetchApproved]);

  return (
    <Card className="border border-border shadow-sm">
      <CardContent className="p-4">
        <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
          <BookOpen className="h-4 w-4 text-emerald-500" />
          Incoming Books
        </h2>

        <div className="flex flex-col gap-3">
          {isLoading && (
            <p className="text-xs text-muted-foreground">
              Loading incoming books...
            </p>
          )}

          {!isLoading && data?.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No approved incoming books yet.
            </p>
          )}

          {data?.map((book) => (
            <div
              key={book.id}
              className="flex items-start gap-3 border-b pb-2 last:border-none"
            >
              <img
                src={ FALLBACK_COVER}
                alt={`Cover of ${book.title}`}
                className="h-14 w-10 rounded object-cover shrink-0"
              />

              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground line-clamp-1">
                  {book.title}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  by {book.author}
                </p>
                <p className="text-[10px] text-emerald-600 mt-1 font-medium">
                  Approved Incoming
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}