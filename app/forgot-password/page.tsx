"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { AuthShell } from "@/components/auth/auth-shell"
import { Spinner } from "@/components/ui/spinner"
import { MailCheck } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
        `${window.location.origin}/auth/callback?next=/reset-password`,
    })
    setIsLoading(false)
    // Always show the same confirmation, regardless of whether the email exists.
    setSent(true)
  }

  return (
    <AuthShell panelTitle="Reset access" panelBody="We'll email you a secure link to choose a new password.">
      {sent ? (
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-accent">
            <MailCheck className="size-6 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              If an account exists for {email}, a password reset link is on its way.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Forgot your password?</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Spinner data-icon="inline-start" />}
                {isLoading ? "Sending..." : "Send reset link"}
              </Button>
            </FieldGroup>
          </form>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
              Back to sign in
            </Link>
          </p>
        </div>
      )}
    </AuthShell>
  )
}
