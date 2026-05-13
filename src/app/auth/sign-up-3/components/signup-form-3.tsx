import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Logo } from "@/components/logo"
import { useAuth, type RegisterPayload } from "@/hooks/use-auth"
import { useDepartmentList } from "@/hooks/useDepartment"

export function SignupForm3({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { register, isLoading, error, clearError } = useAuth()
  const { data: departments, fetchAll: fetchDepartments } = useDepartmentList()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [password2, setPassword2] = useState("")
  const [departmentId, setDepartmentId] = useState<string>("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [localError, setLocalError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Fetch departments on mount
  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setFieldErrors({})
    setLocalError(null)
    setSuccessMessage(null)

    if (password !== password2) {
      setLocalError("Passwords do not match.")
      return
    }
    if (!agreedToTerms) {
      setLocalError("You must agree to the Terms of Service and Privacy Policy.")
      return
    }

    const payload: RegisterPayload = {
      username: email,
      email,
      password,
      password2,
      full_name: fullName,
      ...(departmentId ? { department: Number(departmentId) } : {}),
    }

    const result = await register(payload)

    if (result.ok) {
      setSuccessMessage(
        result.message ||
          "Account created! Please check your email to verify your account."
      )
      setTimeout(() => {
        window.location.href = `/auth/verify-email?username=${encodeURIComponent(result.username)}`
      }, 2500)
    } else {
      setFieldErrors(result.errors ?? {})
    }
  }

  const fieldError = (key: string) => fieldErrors[key]?.[0]

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-6">
              {/* Logo */}
              <div className="flex justify-center mb-2">
                <a href="/" className="flex items-center gap-2 font-medium">
                  <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
                    <Logo size={24} />
                  </div>
                  <span className="text-xl">ShadcnStore</span>
                </a>
              </div>

              {/* Heading */}
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Create your account</h1>
                <p className="text-muted-foreground text-balance">
                  Enter your information to create a new account
                </p>
              </div>

              {/* Success banner */}
              {successMessage && (
                <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
                  {successMessage}
                </div>
              )}

              {/* Global / server error */}
              {(localError || (error && !successMessage)) && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {localError || error}
                </div>
              )}

              {/* Non-field API errors */}
              {fieldErrors.non_field_errors && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {fieldErrors.non_field_errors.join(" ")}
                </div>
              )}

              {/* Full Name */}
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading}
                  aria-invalid={!!fieldError("full_name")}
                />
                {fieldError("full_name") && (
                  <p className="text-xs text-destructive">{fieldError("full_name")}</p>
                )}
              </div>

              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  aria-invalid={!!fieldError("email")}
                />
                {fieldError("email") && (
                  <p className="text-xs text-destructive">{fieldError("email")}</p>
                )}
              </div>

              {/* Department */}
              <div className="grid gap-2">
                <Label htmlFor="department">Department <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Select
                  value={departmentId}
                  onValueChange={setDepartmentId}
                  disabled={isLoading}
                >
                  <SelectTrigger id="department" aria-invalid={!!fieldError("department")}>
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments && departments.length > 0 ? (
                      departments.map((dept) => (
                        <SelectItem key={dept.id} value={String(dept.id)}>
                          {dept.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No departments available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {fieldError("department") && (
                  <p className="text-xs text-destructive">{fieldError("department")}</p>
                )}
              </div>

              {/* Password */}
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  aria-invalid={!!fieldError("password")}
                />
                {fieldError("password") && (
                  <p className="text-xs text-destructive">{fieldError("password")}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="grid gap-2">
                <Label htmlFor="password2">Confirm Password</Label>
                <Input
                  id="password2"
                  type="password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  required
                  disabled={isLoading}
                  aria-invalid={!!fieldError("password2")}
                />
                {fieldError("password2") && (
                  <p className="text-xs text-destructive">{fieldError("password2")}</p>
                )}
              </div>

              {/* Terms checkbox */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) =>
                    setAgreedToTerms(checked === true)
                  }
                  disabled={isLoading}
                />
                <Label htmlFor="terms" className="text-sm leading-snug">
                  I agree to the{" "}
                  <a href="#" className="underline underline-offset-4 hover:text-primary">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="underline underline-offset-4 hover:text-primary">
                    Privacy Policy
                  </a>
                </Label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? "Creating account…" : "Create Account"}
              </Button>

              {/* Sign-in link */}
              <div className="text-center text-sm">
                Already have an account?{" "}
                <a href="/auth/sign-in-3" className="underline underline-offset-4">
                  Sign in
                </a>
              </div>
            </div>
          </form>

          {/* Side image */}
          <div className="bg-muted relative hidden md:block">
            <img
              src="https://www.visiblebody.com/hubfs/Stock%20images/Students%20sitting%20at%20a%20table%20in%20a%20library%20while%20learning%20and%20working%20on%20a%20laptop-1.jpeg"
              alt="Students working"
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