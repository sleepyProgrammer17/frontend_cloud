import { useEffect, useState } from "react"
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/hooks/use-auth"

type Status = "loading" | "success" | "error"

export default function VerifyEmailPage() {
  const { verifyEmail } = useAuth()
  const [status, setStatus] = useState<Status>("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token")

    if (!token) {
      setStatus("error")
      setMessage("No verification token found in the URL.")
      return
    }

    verifyEmail({ token }).then((result) => {
      if (result.ok) {
        setStatus("success")
        setMessage(result.message || "Your email has been verified successfully!")
      } else {
        setStatus("error")
        setMessage(result.error || "Verification failed. The link may have expired.")
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="flex flex-col items-center text-center gap-5 py-12 px-8">

          {/* ── LOADING ── */}
          {status === "loading" && (
            <>
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-2xl font-semibold tracking-tight">Verifying your email</h1>
                <p className="text-sm text-muted-foreground">Hang tight, this only takes a moment…</p>
              </div>
            </>
          )}

          {/* ── SUCCESS ── */}
          {status === "success" && (
            <>
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-2xl font-semibold tracking-tight">Email verified!</h1>
                <p className="text-sm text-muted-foreground">{message}</p>
              </div>
              <Button asChild className="w-full mt-2">
                <a href="/auth/sign-in-3">
                  Continue to sign in
                  <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </Button>
            </>
          )}

          {/* ── ERROR ── */}
          {status === "error" && (
            <>
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-2xl font-semibold tracking-tight">Link expired</h1>
                <p className="text-sm text-muted-foreground">{message}</p>
              </div>
              <div className="flex flex-col gap-2 w-full mt-2">
                <Button asChild className="w-full">
                  <a href="/auth/sign-up-3">Register again</a>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <a href="/auth/sign-in-3">Back to sign in</a>
                </Button>
              </div>
            </>
          )}

        </CardContent>
      </Card>
    </div>
  )
}