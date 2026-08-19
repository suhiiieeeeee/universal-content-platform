"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { AuthShell } from "@/components/auth/auth-shell"
import { Spinner } from "@/components/ui/spinner"

function signUpErrorMessage(error: unknown): string {
  const { code, status } = (error ?? {}) as { code?: string; status?: number }
  if (code === "weak_password") return "Please choose a stronger password."
  if (code === "email_address_invalid") {
    return "Please use a real email address — example and test domains are not supported."
  }
  if (code === "email_address_not_authorized") {
    return "We cannot send confirmation email to that address. Please use a different one."
  }
  if (code === "validation_failed") return "Please check the details you entered."
  if (code === "over_email_send_rate_limit" || status === 429) {
    return "Too many attempts. Please wait a moment and try again."
  }
  return "Unable to complete sign-up. Please try again."
}

export default function SignupPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!/^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/.test(username)) {
      setError("Username must be 3-32 characters: lowercase letters, numbers, and hyphens.")
      return
    }
    if (password !== repeatPassword) {
      setError("Passwords do not match.")
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
          data: { username },
        },
      })
      if (error) throw error
      router.push("/signup/success")
    } catch (error: unknown) {
      setError(signUpErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthShell
      panelTitle="Ship structured content in minutes"
      panelBody="Define collections, edit documents visually or in JSON/Markdown, and publish through a versioned REST API."
    >
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Start managing content the way you write code.</p>
        </div>
        <form onSubmit={handleSignUp}>
          <FieldGroup>
            <Field data-invalid={!!error}>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                placeholder="acme"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                aria-invalid={!!error}
              />
              <FieldDescription>Used in your public API path, e.g. /api/v1/u/{username || "you"}</FieldDescription>
            </Field>
            <Field data-invalid={!!error}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!error}
              />
            </Field>
            <Field data-invalid={!!error}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!error}
              />
            </Field>
            <Field data-invalid={!!error}>
              <FieldLabel htmlFor="repeat-password">Repeat password</FieldLabel>
              <Input
                id="repeat-password"
                type="password"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                aria-invalid={!!error}
              />
              {error && <FieldDescription className="text-destructive">{error}</FieldDescription>}
            </Field>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Spinner data-icon="inline-start" />}
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </FieldGroup>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
