"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { GripVertical, Loader2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { saveSchema } from "@/lib/actions/collections"
import type { SchemaField, SchemaFieldType } from "@/lib/types"

const FIELD_TYPES: { value: SchemaFieldType; label: string }[] = [
  { value: "string", label: "Text" },
  { value: "text", label: "Long text" },
  { value: "markdown", label: "Markdown" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "url", label: "URL" },
  { value: "date", label: "Date" },
  { value: "array", label: "List" },
  { value: "object", label: "Object" },
  { value: "json", label: "JSON" },
]

function slugifyKey(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48)
}

export function SchemaEditor({
  workspaceId,
  collectionId,
  schemaId,
  schemaName,
  initialFields,
}: {
  workspaceId: string
  collectionId: string
  schemaId: string | null
  schemaName: string
  initialFields: SchemaField[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(schemaName || "Default schema")
  const [fields, setFields] = useState<SchemaField[]>(initialFields.length > 0 ? initialFields : [])
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addField() {
    setFields((prev) => [...prev, { key: "", label: "", type: "string", required: false }])
  }

  function updateField(index: number, patch: Partial<SchemaField>) {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)))
  }

  function removeField(index: number) {
    setFields((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSave() {
    setError(null)
    const cleaned = fields
      .map((f) => ({ ...f, key: slugifyKey(f.key || f.label), label: f.label.trim() }))
      .filter((f) => f.key && f.label)

    if (cleaned.length === 0) {
      setError("Add at least one field.")
      return
    }
    const keys = new Set<string>()
    for (const f of cleaned) {
      if (keys.has(f.key)) {
        setError(`Duplicate field key "${f.key}".`)
        return
      }
      keys.add(f.key)
    }

    setPending(true)
    const result = await saveSchema(workspaceId, collectionId, name.trim() || "Default schema", cleaned, schemaId)
    setPending(false)
    if (!result.ok) {
      setError(result.error ?? "Could not save schema.")
      return
    }
    setOpen(false)
    router.refresh()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          Edit schema
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="font-mono">Schema</SheetTitle>
          <SheetDescription>Define the fields documents in this collection must follow.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" htmlFor="schema-name">
              Schema name
            </label>
            <Input id="schema-name" value={name} onChange={(e) => setName(e.target.value)} disabled={pending} />
          </div>

          <div className="flex flex-col gap-2">
            {fields.map((field, index) => (
              <div key={index} className="flex items-start gap-2 rounded-md border border-border p-2">
                <GripVertical className="mt-2.5 size-3.5 shrink-0 text-muted-foreground" />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Field label"
                      value={field.label}
                      onChange={(e) => updateField(index, { label: e.target.value })}
                      disabled={pending}
                      className="flex-1"
                    />
                    <Select
                      value={field.type}
                      onValueChange={(v) => updateField(index, { type: v as SchemaFieldType })}
                      disabled={pending}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Key: {slugifyKey(field.key || field.label) || "—"}
                    </span>
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Checkbox
                        checked={field.required}
                        onCheckedChange={(v) => updateField(index, { required: !!v })}
                        disabled={pending}
                      />
                      Required
                    </label>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeField(index)} disabled={pending}>
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addField} disabled={pending} className="w-full">
              <Plus data-icon="inline-start" />
              Add field
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <SheetFooter>
          <Button onClick={handleSave} disabled={pending} className="w-full">
            {pending && <Loader2 className="animate-spin" data-icon="inline-start" />}
            Save schema
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
