"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "@/components/logo"
import { useAuth } from "@/hooks/use-auth"

export function LoginForm3({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuth()

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

 async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault()
  clearError()

  const result = await login({ username, password })

  if (result.ok) {
    // Check role
    if (result.user?.role === "librarian") {
      navigate("/dashboard")
    } else {
      navigate("/books")
    }
  }
}

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex justify-center mb-2">
                <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
                  <Logo size={24} />
                </div>
                <span className="text-xl">ShadcnStore</span>
              </div>

              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your ShadcnStore account
                </p>
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
                  {error}
                </div>
              )}

              <div className="grid gap-3">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="your_username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="/auth/forgot-password"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                {isLoading ? "Logging in…" : "Login"}
              </Button>

              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t" />

              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/auth/sign-up-3" className="underline underline-offset-4">
                  Sign up
                </a>
              </div>
            </div>
          </form>

          <div className="bg-muted relative hidden md:block">
            <img
              src="https://www.visiblebody.com/hs-fs/hubfs/Stock%20images/students%20group%20working%20on%20school%20%20project%20%20together%20at%20modern%20university%2C%20top%20view%20teamwork%20business%20concept.jpeg?width=1000&name=students%20group%20working%20on%20school%20%20project%20%20together%20at%20modern%20university%2C%20top%20view%20teamwork%20business%20concept.jpeg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.95] dark:invert"
            />
          </div>
        </CardContent>
      </Card>

      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}