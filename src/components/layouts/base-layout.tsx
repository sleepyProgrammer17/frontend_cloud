"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ThemeCustomizer, ThemeCustomizerTrigger } from "@/components/theme-customizer"
import { BorrowWithScanDialog, type BorrowPayload, type BorrowResult } from "@/app/borrowbooks/borrowed-dialog"
import { BookSuggestionDialog, type SuggestionPayload } from "@/app/borrowbooks/book-suggestion"
import { useCreateBorrowedBook } from "@/hooks/use-borrow"
import { useCreateBookSuggestion } from "@/hooks/useBookSuggestion"
import { BookPlus, Lightbulb } from "lucide-react"
import { useSidebarConfig } from "@/hooks/use-sidebar-config"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

interface BaseLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export function BaseLayout({ children, title, description }: BaseLayoutProps) {
  const [themeCustomizerOpen, setThemeCustomizerOpen] = React.useState(false)
  const [borrowDialogOpen,    setBorrowDialogOpen]    = React.useState(false)
  const [borrowResult,        setBorrowResult]        = React.useState<BorrowResult | null>(null)
  const [suggestDialogOpen,   setSuggestDialogOpen]   = React.useState(false)

  const { config } = useSidebarConfig()
  const { create: createBorrow,  isLoading: isBorrowing  } = useCreateBorrowedBook()
  const { create: createSuggest, isLoading: isSuggesting } = useCreateBookSuggestion()

  const handleBorrowConfirm = async (payload: BorrowPayload) => {
    const res = await createBorrow(payload)
    if (res.ok) {
      setBorrowResult({ success: true, message: "Book checked out successfully." })
    } else {
      setBorrowResult({ success: false, message: res.error })
    }
  }

  const handleBorrowResultClose = () => {
    setBorrowResult(null)
    setBorrowDialogOpen(false)
  }

  const handleSuggestConfirm = async (payload: SuggestionPayload) => {
    const result = await createSuggest(payload)
    if (result.ok) setSuggestDialogOpen(false)
  }

  const inner = (
    <SidebarInset>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {title && (
              <div className="px-4 lg:px-6">
                <div className="flex flex-col gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                  {description && (
                    <p className="text-muted-foreground">{description}</p>
                  )}
                </div>
              </div>
            )}
            {children}
          </div>
        </div>
      </div>
      <SiteFooter />
    </SidebarInset>
  )

  const sidebar = (
    <AppSidebar
      variant={config.variant}
      collapsible={config.collapsible}
      side={config.side}
    />
  )

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "3rem",
          "--header-height": "calc(var(--spacing) * 14)",
        } as React.CSSProperties
      }
      className={config.collapsible === "none" ? "sidebar-none-mode" : ""}
    >
      {config.side === "left" ? <>{sidebar}{inner}</> : <>{inner}{sidebar}</>}

      {/* Theme Customizer */}
      <ThemeCustomizerTrigger onClick={() => setThemeCustomizerOpen(true)} />
      <ThemeCustomizer
        open={themeCustomizerOpen}
        onOpenChange={setThemeCustomizerOpen}
      />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        <button
          onClick={() => setSuggestDialogOpen(true)}
          aria-label="Suggest a book"
          className="flex items-center gap-2 rounded-full bg-secondary px-4 py-3 text-sm font-medium text-secondary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          <Lightbulb className="size-4" />
          <span>Suggest</span>
        </button>

        <button
          onClick={() => setBorrowDialogOpen(true)}
          aria-label="Borrow a book"
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          <BookPlus className="size-4" />
          <span>Borrow</span>
        </button>
      </div>

      {/* Borrow Dialog */}
      <BorrowWithScanDialog
        open={borrowDialogOpen}
        isSubmitting={isBorrowing}
        result={borrowResult}
        onClose={() => setBorrowDialogOpen(false)}
        onConfirm={handleBorrowConfirm}
        onResultClose={handleBorrowResultClose}
      />

      {/* Suggest Dialog */}
      <BookSuggestionDialog
        open={suggestDialogOpen}
        isSubmitting={isSuggesting}
        onClose={() => setSuggestDialogOpen(false)}
        onConfirm={handleSuggestConfirm}
      />
    </SidebarProvider>
  )
}