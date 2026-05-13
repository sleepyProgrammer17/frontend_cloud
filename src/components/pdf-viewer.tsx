'use client'

import {
  CommandsPlugin,
  PDFViewer,
  UIPlugin,
} from '@embedpdf/react-pdf-viewer'

import type { PDFViewerRef } from '@embedpdf/react-pdf-viewer'
import { useRef, useEffect, useContext } from 'react'
import { ThemeProviderContext } from '@/contexts/theme-context'
import { useIncrementResearchView } from '@/hooks/useResearch'
import { useIncrementResourcesRead } from '@/hooks/useDigitalResources' // ← adjust to your actual path

// ── Reusable hook ───────────────────────────────────────────────────────────
type TrackViewMode = 'research' | 'digital'

function useTrackViewAfterDelay(mode: TrackViewMode, id: string | undefined) {
  const { incrementView: incrementResearchView } = useIncrementResearchView()
  const { incrementView: incrementDigitalView }  = useIncrementResourcesRead()
  const hasTracked = useRef(false)

  useEffect(() => {
    if (!id) return
    hasTracked.current = false  // reset on id change

    const timer = setTimeout(async () => {
      if (hasTracked.current) return
      hasTracked.current = true

      if (mode === 'research') await incrementResearchView(id)
      if (mode === 'digital')  await incrementDigitalView(id)
    },  2 * 60 * 1000)

    return () => clearTimeout(timer)
  }, [id, mode])
}
// ───────────────────────────────────────────────────────────────────────────

export interface PDFViewerPanelProps {
  src: string
  researchId?: string
  digitalId?: string    
  disabledCategories?: string[]
  onBack?: () => void
  backLabel?: string
  style?: React.CSSProperties
  title?: string
}

const DEFAULT_DISABLED_CATEGORIES = [
  'annotation',
  'redaction',
  'document-print',
  'document-export',
  'document-screenshot',
  'document-menu',
  'copy',
]

const DEFAULT_PERMISSIONS = {
  enforceDocumentPermissions: false,
  overrides: {
    print: false,
    printHighQuality: false,
    copyContents: false,
    modifyContents: false,
    modifyAnnotations: false,
  },
}

const PURE_DARK_THEME = {
  accent: {
    primary: '#000000',
    primaryHover: '#0a0a0a',
    primaryActive: '#111111',
    primaryLight: '#0d0d0d',
    primaryForeground: '#ffffff',
  },
  background: {
    app: '#09090b',
    surface: '#18181b',
    surfaceAlt: '#27272a',
    elevated: '#3f3f46',
    overlay: 'rgba(0,0,0,0.6)',
    input: '#27272a',
  },
  foreground: {
    primary: '#fafafa',
    secondary: '#a1a1aa',
    muted: '#71717a',
    disabled: '#52525b',
    onAccent: '#ffffff',
  },
  interactive: {
    hover: '#27272a',
    active: '#ffffff',
    selected: '#fffdfdb7',
    focus: '#eeeeee',
  },
  border: {
    default: '#27272a',
    subtle: '#18181b',
    strong: '#3f3f46',
  },
}

function useResolvedTheme(): 'light' | 'dark' {
  const { theme } = useContext(ThemeProviderContext)
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

function ChevronLeftIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

export default function PDFViewerPanel({
  src,
  researchId,
  digitalId,
  disabledCategories = DEFAULT_DISABLED_CATEGORIES,
  onBack,
  backLabel = 'Back',
  style,
  title,
}: PDFViewerPanelProps) {
  const viewerRef = useRef<PDFViewerRef | null>(null)
  const theme     = useResolvedTheme()
  const isDark    = theme === 'dark'

  // ── Track view after 3 minutes ──────────────────────────────────────────
  useTrackViewAfterDelay('research', researchId)
  useTrackViewAfterDelay('digital',digitalId)

  // ── Sync theme ──────────────────────────────────────────────────────────
  useEffect(() => {
    viewerRef.current?.container?.setTheme({ preference: theme })
  }, [theme])

  // ── Apply disabled categories ───────────────────────────────────────────
  useEffect(() => {
    if (!viewerRef.current?.container) return
    const applyCategories = async () => {
      const registry = await viewerRef.current!.container!.registry
      registry.getPlugin<CommandsPlugin>('commands')?.provides()
        .setDisabledCategories(disabledCategories)
      registry.getPlugin<UIPlugin>('ui')?.provides()
        .setDisabledCategories(disabledCategories)
    }
    applyCategories()
  }, [disabledCategories])

  const btnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '5px 12px',
    borderRadius: '6px',
    border: isDark ? '1px solid #111111' : '1px solid rgba(0,0,0,0.15)',
    background: isDark ? '#000000' : 'rgba(255,255,255,0.9)',
    color: isDark ? '#ffffff' : '#222',
    fontSize: '13px',
    fontFamily: 'system-ui, sans-serif',
    fontWeight: 500,
    cursor: 'pointer',
    boxShadow: isDark ? '0 1px 4px rgba(0,0,0,0.8)' : '0 1px 4px rgba(0,0,0,0.1)',
    transition: 'background 0.2s, color 0.2s, border 0.2s',
    whiteSpace: 'nowrap',
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: isDark ? '#09090b' : '#ffffff',
        ...style,
      }}
    >
      {/* ── Top bar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px',
          background: isDark ? '#000000' : '#ffffff',
          borderBottom: isDark ? '1px solid #111111' : '1px solid #e5e5e5',
          flexShrink: 0,
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onBack && (
            <button onClick={onBack} title="Go back" style={btnStyle}>
              <ChevronLeftIcon />
              {backLabel}
            </button>
          )}
          {title && (
            <span
              style={{
                fontSize: '13px',
                fontFamily: 'system-ui, sans-serif',
                fontWeight: 600,
                color: isDark ? '#ffffff' : '#000000',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '280px',
              }}
            >
              {title}
            </span>
          )}
        </div>
      </div>

      {/* ── PDF Viewer ── */}
      <style>{`
        .pdf-viewer-no-scroll * {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .pdf-viewer-no-scroll *::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <PDFViewer
        ref={viewerRef}
        config={{
          src,
          theme: {
            preference: theme,
            dark: PURE_DARK_THEME,
          },
          disabledCategories,
          permissions: DEFAULT_PERMISSIONS,
        }}
        className="pdf-viewer-no-scroll"
        style={{ width: '100%', flex: 1, minHeight: 1 }}
      />
    </div>
  )
}