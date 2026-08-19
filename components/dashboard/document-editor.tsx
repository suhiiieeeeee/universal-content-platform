"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateDocument } from "@/lib/actions/documents"
import type { DocumentStatus, DocumentVisibility, SchemaField } from "@/lib/types"

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
          rows={6}
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
          rows={6}
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

export function DocumentEditor({
  documentId,
  fields,
  initialData,
  initialStatus,
  initialVisibility,
}: {
  documentId: string
  fields: SchemaField[]
  initialData: Record<string, unknown>
  initialStatus: DocumentStatus
  initialVisibility: DocumentVisibility
}) {
  const router = useRouter()
  const [values, setValues] = useState<Record<string, unknown>>(initialData)
  const [status, setStatus] = useState<DocumentStatus>(initialStatus)
  const [visibility, setVisibility] = useState<DocumentVisibility>(initialVisibility)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function setValue(key: string, v: unknown) {
    setValues((prev) => ({ ...prev, [key]: v }))
    setSaved(false)
  }

  async function handleSave() {
    setError(null)
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
    const result = await updateDocument(documentId, { data, status, visibility })
    setPending(false)
    if (!result.ok) {
      setError(result.error ?? "Could not save document.")
      return
    }
    setSaved(true)
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="doc-status">Status</FieldLabel>
          <Select value={status} onValueChange={(v) => { setStatus(v as DocumentStatus); setSaved(false) }} disabled={pending}>
            <SelectTrigger id="doc-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor="doc-visibility">Visibility</FieldLabel>
          <Select value={visibility} onValueChange={(v) => { setVisibility(v as DocumentVisibility); setSaved(false) }} disabled={pending}>
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
      </div>

      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground">This collection has no schema fields defined.</p>
      ) : (
        <FieldGroup>
          {fields.map((f) => (
            <Field key={f.key}>
              <FieldLabel htmlFor={`edit-field-${f.key}`}>
                {f.label}
                {f.required && <span className="text-destructive"> *</span>}
              </FieldLabel>
              {fieldInput(f, values[f.key], (v) => setValue(f.key, v), pending)}
            </Field>
          ))}
        </FieldGroup>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={pending}>
          {pending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Save data-icon="inline-start" />}
          Save changes
        </Button>
        {saved && !pending && <span className="text-sm text-muted-foreground">Saved</span>}
      </div>
    </div>
  )
}
