"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BookPlus,
  Camera,
  CameraOff,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OverdueSetting {
  id: string
  fee_per_day: string | number
}

export interface BorrowPayload {
  copy: string
  due_date: string
  status: "pending"
  is_damaged: boolean
  overdue_setting?: string
  remarks?: string
}

export interface BorrowResult {
  success: boolean
  message?: string
  detail?: string
}

interface BorrowWithScanDialogProps {
  open: boolean
  isSubmitting: boolean
  overdueSettings?: OverdueSetting[]
  result?: BorrowResult | null
  onClose: () => void
  onConfirm: (payload: BorrowPayload) => void
  onResultClose?: () => void
}

// Extend Window for BarcodeDetector
declare global {
  interface Window {
    BarcodeDetector?: typeof BarcodeDetector
  }
  class BarcodeDetector {
    constructor(options?: { formats?: string[] })
    static getSupportedFormats(): Promise<string[]>
    detect(
      source: HTMLVideoElement | HTMLImageElement | ImageBitmap
    ): Promise<Array<{ rawValue: string }>>
  }
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function BorrowWithScanDialog({
  open,
  isSubmitting,
  overdueSettings = [],
  result,
  onClose,
  onConfirm,
  onResultClose,
}: BorrowWithScanDialogProps) {

  // ── form state ─────────────────────────────────────────────────────────────
  const [copyId,         setCopyId]         = useState<string>("")
  const [overdueSetting, setOverdueSetting] = useState<string>("")
  const [remarks,        setRemarks]        = useState<string>("")

  // ── scan state ─────────────────────────────────────────────────────────────
  const [isCameraOn,  setIsCameraOn]  = useState<boolean>(false)
  const [isScanning,  setIsScanning]  = useState<boolean>(false)
  const [scanError,   setScanError]   = useState<string | null>(null)
  const [scanSuccess, setScanSuccess] = useState<boolean>(false)

  const videoRef    = useRef<HTMLVideoElement>(null)
  const streamRef   = useRef<MediaStream | null>(null)
  const rafRef      = useRef<number | null>(null)
  const detectorRef = useRef<InstanceType<typeof BarcodeDetector> | null>(null)

  // ── init BarcodeDetector ───────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined" && "BarcodeDetector" in window) {
      BarcodeDetector.getSupportedFormats().then((formats: string[]) => {
        detectorRef.current = new BarcodeDetector({
          formats: formats.filter((f) =>
            ["qr_code", "code_128", "code_39", "ean_13", "ean_8", "data_matrix"].includes(f)
          ),
        })
      })
    }
  }, [])

  // ── stop camera on dialog close ────────────────────────────────────────────
  useEffect(() => {
    if (!open) stopCamera()
  }, [open])

  // ── camera helpers ─────────────────────────────────────────────────────────

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    setIsCameraOn(false)
    setIsScanning(false)
  }, [])

  const scanLoop = useCallback(() => {
    if (!detectorRef.current || !videoRef.current) return

    const detect = async () => {
      try {
        if (videoRef.current && videoRef.current.readyState >= 2) {
          const results = await detectorRef.current!.detect(videoRef.current)
          if (results.length > 0) {
            const value = results[0].rawValue.trim()
            setCopyId(value)
            setScanSuccess(true)
            stopCamera()
            return
          }
        }
      } catch {
        // silently ignore detection errors
      }
      rafRef.current = requestAnimationFrame(detect)
    }

    rafRef.current = requestAnimationFrame(detect)
  }, [stopCamera])

  const startCamera = useCallback(async () => {
    setScanError(null)
    setScanSuccess(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setIsCameraOn(true)
      setIsScanning(true)
      scanLoop()
    } catch {
      setScanError("Camera access denied or unavailable.")
    }
  }, [scanLoop])

  // ── form helpers ───────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setCopyId("")
    setOverdueSetting("")
    setRemarks("")
    setScanError(null)
    setScanSuccess(false)
    stopCamera()
  }, [stopCamera])

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleDone = () => {
    reset()
    onResultClose?.()
  }

  const handleConfirm = () => {
    if (!copyId.trim()) return
    onConfirm({
      copy:            copyId.trim(),
      due_date:        new Date().toISOString(),
      status:          "pending",
      is_damaged:      false,
      overdue_setting: overdueSetting || undefined,
      remarks:         remarks.trim() || undefined,
    })
  }

  const handleBorrowAnother = () => {
    reset()
    onResultClose?.()
  }

  const isValid = copyId.trim() !== ""

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">

        {/* ── Result screen (success or failure) ─────────────────────────── */}
        {result != null ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle2 className="size-4 text-green-500" />
                ) : (
                  <XCircle className="size-4 text-destructive" />
                )}
                {result.success ? "Borrow confirmed" : "Something went wrong"}
              </DialogTitle>
              <DialogDescription>
                {result.success
                  ? "The book has been successfully checked out."
                  : "The borrow request could not be completed."}
              </DialogDescription>
            </DialogHeader>

            <div
              className={`rounded-lg border px-4 py-3 text-sm space-y-1 ${
                result.success
                  ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
                  : "border-destructive/30 bg-destructive/5 text-destructive"
              }`}
            >
              {result.message && <p>{result.message}</p>}
              {result.detail  && <p className="opacity-75 text-xs">{result.detail}</p>}
            </div>

            <DialogFooter className="gap-2">
              {result.success ? (
                <>
                  <Button variant="outline" onClick={handleDone}>
                    Done
                  </Button>
                  <Button onClick={handleBorrowAnother} className="gap-2">
                    <BookPlus className="size-3.5" />
                    Borrow another
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={handleDone}>
                    Cancel
                  </Button>
                  <Button onClick={handleBorrowAnother} className="gap-2">
                    Try again
                  </Button>
                </>
              )}
            </DialogFooter>
          </>
        ) : (

        /* ── Form screen ──────────────────────────────────────────────────── */
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookPlus className="size-4 text-primary" />
              Borrow a Book
            </DialogTitle>
            <DialogDescription>
              Scan the book copy's barcode or QR code to continue.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">

            {/* ── Scanner ───────────────────────────────────────────────── */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Book Copy ID <span className="text-destructive">*</span>
              </Label>

              <div className="relative overflow-hidden rounded-lg border border-border bg-muted aspect-video">
                <video
                  ref={videoRef}
                  muted
                  playsInline
                  className={`w-full h-full object-cover ${isCameraOn ? "block" : "hidden"}`}
                />

                {!isCameraOn && !scanSuccess && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <Camera className="size-8 opacity-40" />
                    <span className="text-xs">Camera preview</span>
                  </div>
                )}

                {isCameraOn && isScanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div
                      className="w-4/5 h-px bg-red-500 opacity-80"
                      style={{ animation: "scanLine 2s ease-in-out infinite" }}
                    />
                    <span className="mt-3 text-xs text-white bg-black/50 px-2 py-0.5 rounded">
                      Align barcode with the line
                    </span>
                  </div>
                )}

                {scanSuccess && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60">
                    <CheckCircle2 className="size-10 text-green-400" />
                    <span className="text-xs text-white font-medium">Scanned!</span>
                  </div>
                )}
              </div>

              <style>{`
                @keyframes scanLine {
                  0%   { transform: translateY(-48px); opacity: 0.3; }
                  50%  { transform: translateY(0);     opacity: 1;   }
                  100% { transform: translateY(48px);  opacity: 0.3; }
                }
              `}</style>

              <div className="flex gap-2">
                {!isCameraOn ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2 cursor-pointer"
                    onClick={startCamera}
                  >
                    <Camera className="size-4" />
                    Start camera
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2 cursor-pointer"
                    onClick={stopCamera}
                  >
                    <CameraOff className="size-4" />
                    Stop camera
                  </Button>
                )}
              </div>

              {copyId && (
                <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2">
                  <CheckCircle2 className="size-4 text-green-500 shrink-0" />
                  <span className="text-sm font-mono truncate">{copyId}</span>
                  <button
                    type="button"
                    onClick={() => { setCopyId(""); setScanSuccess(false) }}
                    className="ml-auto text-xs text-muted-foreground hover:text-foreground shrink-0"
                  >
                    Clear
                  </button>
                </div>
              )}

              {scanError && (
                <p className="text-xs text-destructive">{scanError}</p>
              )}
            </div>

            {/* ── Overdue Fee ────────────────────────────────────────────── */}
            {overdueSettings.length > 0 && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Overdue fee setting{" "}
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Select value={overdueSetting} onValueChange={setOverdueSetting}>
                  <SelectTrigger className="w-full cursor-pointer">
                    <SelectValue placeholder="Select fee schedule…" />
                  </SelectTrigger>
                  <SelectContent>
                    {overdueSettings.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        ₱{parseFloat(String(s.fee_per_day)).toFixed(2)} / day
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* ── Remarks ──────────────────────────────────────────────── */}
            <div className="space-y-1.5">
              <Label htmlFor="borrow-remarks" className="text-sm font-medium">
                Remarks{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="borrow-remarks"
                placeholder="Add any notes about this borrowing…"
                value={remarks}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRemarks(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isSubmitting || !isValid}
              className="gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <BookPlus className="size-3.5" />
              )}
              Confirm borrow
            </Button>
          </DialogFooter>
        </>
        )}
      </DialogContent>
    </Dialog>
  )
}