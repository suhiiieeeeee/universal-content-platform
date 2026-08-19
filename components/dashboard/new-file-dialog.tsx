"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FilePlus, Loader2 } from "lucide-react"
import { createDocument } from "@/lib/actions/documents"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import type { DocumentVisibility } from "@/lib/types"

export function NewFileDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState<"json" | "markdown">("json")
  const [visibility, setVisibility] = useState<DocumentVisibility>("private")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setError(null)
    if (name.trim().length < 2) return setError("File name must be at least 2 characters.")
    setPending(true)
    const result = await createDocument(null, name, type === "markdown" ? { content: "" } : {}, visibility, type)
    setPending(false)
    if (!result.ok) return setError(result.error ?? "Could not create file.")
    setOpen(false)
    router.push(`/dashboard/files/${result.data.id}`)
    router.refresh()
  }

  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger render={<Button><FilePlus data-icon="inline-start" />New file</Button>} />
    <DialogContent className="sm:max-w-lg">
      <DialogHeader><DialogTitle>New file</DialogTitle><DialogDescription>Create a standalone JSON or Markdown file. You can organize it into a collection later.</DialogDescription></DialogHeader>
      <FieldGroup>
        <Field><FieldLabel htmlFor="file-name">File name</FieldLabel><Input id="file-name" placeholder="about.md or projects.json" value={name} onChange={(event) => setName(event.target.value)} disabled={pending} autoFocus /></Field>
        <Field><FieldLabel>Type</FieldLabel><Select value={type} onValueChange={(value) => setType(value as "json" | "markdown")} disabled={pending}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="json">JSON</SelectItem><SelectItem value="markdown">Markdown</SelectItem></SelectContent></Select></Field>
        <Field><FieldLabel>Visibility</FieldLabel><Select value={visibility} onValueChange={(value) => setVisibility(value as DocumentVisibility)} disabled={pending}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="private">Private</SelectItem><SelectItem value="unlisted">Unlisted</SelectItem><SelectItem value="public">Public</SelectItem></SelectContent></Select></Field>
        {error && <FieldError>{error}</FieldError>}
      </FieldGroup>
      <DialogFooter><Button onClick={submit} disabled={pending}>{pending && <Loader2 className="animate-spin" data-icon="inline-start" />}Create file</Button></DialogFooter>
    </DialogContent>
  </Dialog>
}
