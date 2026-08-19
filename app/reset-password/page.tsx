"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { AuthShell } from "@/components/auth/auth-shell"
import { Spinner } from "@/components/ui/spinner"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password !== repeatPassword) {
      setError("Passwords do not match.")
      return
    }
    setIsLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setIsLoading(false)
    if (error) {
      setError("Unable to update password. Please request a new reset link.")
      return
    }
    router.push("/dashboard")
  }

  return (
    <AuthShell panelTitle="Choose a new password" panelBody="Pick something strong and unique to your Datakit account.">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Set a new password</h1>
        </div>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field data-invalid={!!error}>
              <FieldLabel htmlFor="password">New password</FieldLabel>
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
              {isLoading ? "Updating..." : "Update password"}
            </Button>
          </FieldGroup>
        </form>
      </div>
    </AuthShell>
  )
}
