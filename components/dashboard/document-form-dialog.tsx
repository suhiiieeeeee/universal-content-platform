"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createDocument } from "@/lib/actions/documents"
import type { DocumentVisibility, SchemaField } from "@/lib/types"

function fieldInput(
  field: SchemaField,
  value: unknown,
  onChange: (v: unknown) => void,
  disabled: boolean,
) {
  switch (field.type) {
    case "boolean":
      return <Switch checked={!!value} onCheckedChange={onChange} disabled={disabled} />
    case "number":
      return (
        <Input
          type="number"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          disabled={disabled}
        />
      )
    case "date":
      return (
        <Input
          type="date"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      )
    case "text":
    case "markdown":
      return (
        <Textarea
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={4}
        />
      )
    case "json":
    case "array":
    case "object":
      return (
        <Textarea
          value={typeof value === "string" ? value : JSON.stringify(value ?? (field.type === "array" ? [] : {}), null, 2)}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={4}
          className="font-mono text-xs"
        />
      )
    default:
      return (
        <Input
          type={field.type === "url" ? "url" : "text"}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      )
  }
}

export function DocumentFormDialog({
  collectionId,
  workspaceSlug,
  collectionSlug,
  fields,
}: {
  collectionId: string
  workspaceSlug: string
  collectionSlug: string
  fields: SchemaField[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [slug, setSlug] = useState("")
  const [visibility, setVisibility] = useState<DocumentVisibility>("private")
  const [values, setValues] = useState<Record<string, unknown>>({})

  function setValue(key: string, v: unknown) {
    setValues((prev) => ({ ...prev, [key]: v }))
  }

  async function handleSubmit() {
    setError(null)
    if (!slug.trim()) {
      setError("Slug is required.")
      return
    }

    const data: Record<string, unknown> = {}
    for (const f of fields) {
      let v = values[f.key]
      if (f.required && (v === undefined || v === "" || v === null)) {
        setError(`"${f.label}" is required.`)
        return
      }
      if ((f.type === "json" || f.type === "array" || f.type === "object") && typeof v === "string" && v.trim()) {
        try {
          v = JSON.parse(v)
        } catch {
          setError(`"${f.label}" must be valid JSON.`)
          return
        }
      }
      if (v !== undefined) data[f.key] = v
    }

    setPending(true)
    const result = await createDocument(collectionId, slug, data, visibility)
    setPending(false)
    if (!result.ok) {
      setError(result.error ?? "Could not create document.")
      return
    }
    setOpen(false)
    setSlug("")
    setValues({})
    router.push(`/dashboard/workspaces/${workspaceSlug}/collections/${collectionSlug}/documents/${result.data?.slug}`)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus data-icon="inline-start" />
          New document
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-mono">New document</DialogTitle>
          <DialogDescription>Fill in the fields defined by this collection&apos;s schema.</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field data-invalid={!!error && !slug}>
            <FieldLabel htmlFor="doc-slug">Slug</FieldLabel>
            <Input id="doc-slug" value={slug} onChange={(e) => setSlug(e.target.value)} disabled={pending} autoFocus />
            <FieldDescription>Used in the document URL.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="doc-visibility">Visibility</FieldLabel>
            <Select value={visibility} onValueChange={(v) => setVisibility(v as DocumentVisibility)} disabled={pending}>
              <SelectTrigger id="doc-visibility">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="unlisted">Unlisted</SelectItem>
                <SelectItem value="public">Public</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              This collection has no schema fields yet. Add a schema to structure documents.
            </p>
          ) : (
            fields.map((f) => (
              <Field key={f.key}>
                <FieldLabel htmlFor={`field-${f.key}`}>
                  {f.label}
                  {f.required && <span className="text-destructive"> *</span>}
                </FieldLabel>
                {fieldInput(f, values[f.key], (v) => setValue(f.key, v), pending)}
              </Field>
            ))
          )}
          {error && <FieldError>{error}</FieldError>}
        </FieldGroup>
        <DialogFooter className="mt-2">
          <Button onClick={handleSubmit} disabled={pending} className="w-full">
            {pending && <Loader2 className="animate-spin" data-icon="inline-start" />}
            Create document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
