"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel, FieldDescription, FieldError } from "@/components/ui/field"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createWorkspace } from "@/lib/actions/workspaces"

export default function NewWorkspacePage() {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await createWorkspace(formData)
    setPending(false)
    if (!result.ok) {
      setError(result.error ?? "Something went wrong.")
      return
    }
    router.push(`/dashboard/workspaces/${result.data?.slug}`)
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Back to dashboard
        </Link>
        <Card>
          <CardHeader>
            <CardTitle className="font-mono">New workspace</CardTitle>
            <CardDescription>Workspaces hold your collections, documents, and team members.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit}>
              <FieldGroup>
                <Field data-invalid={!!error}>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input id="name" name="name" placeholder="Acme Docs" required autoFocus disabled={pending} />
                  <FieldDescription>This becomes your workspace URL slug.</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="description">Description (optional)</FieldLabel>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="What is this workspace for?"
                    disabled={pending}
                    rows={3}
                  />
                </Field>
                {error && <FieldError>{error}</FieldError>}
                <Button type="submit" disabled={pending} className="w-full">
                  {pending && <Loader2 className="animate-spin" data-icon="inline-start" />}
                  Create workspace
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
