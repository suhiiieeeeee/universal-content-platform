"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Save } from "lucide-react"
import { updateDocument } from "@/lib/actions/documents"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { DocumentStatus, DocumentVisibility } from "@/lib/types"

export function StandaloneFileEditor({ documentId, type, initialData, initialStatus, initialVisibility }: { documentId: string; type: "json" | "markdown"; initialData: Record<string, unknown>; initialStatus: DocumentStatus; initialVisibility: DocumentVisibility }) {
  const router = useRouter()
  const [value, setValue] = useState(type === "markdown" ? String(initialData.content ?? "") : JSON.stringify(initialData, null, 2))
  const [status, setStatus] = useState(initialStatus)
  const [visibility, setVisibility] = useState(initialVisibility)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [pending, setPending] = useState(false)

  async function save() {
    setError(null)
    let data: Record<string, unknown>
    if (type === "markdown") data = { content: value }
    else { try { const parsed = JSON.parse(value); if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error(); data = parsed } catch { setError("JSON must be a valid object before it can be saved."); return } }
    setPending(true)
    const result = await updateDocument(documentId, { data, status, visibility })
    setPending(false)
    if (!result.ok) return setError(result.error ?? "Could not save file.")
    setSaved(true); router.refresh()
  }

  return <div className="flex flex-col gap-4"><div className="flex flex-wrap items-center gap-3"><Select value={status} onValueChange={(v) => { setStatus(v as DocumentStatus); setSaved(false) }}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent></Select><Select value={visibility} onValueChange={(v) => { setVisibility(v as DocumentVisibility); setSaved(false) }}><SelectTrigger className="w-36"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="private">Private</SelectItem><SelectItem value="unlisted">Unlisted</SelectItem><SelectItem value="public">Public</SelectItem></SelectContent></Select><Button onClick={save} disabled={pending}>{pending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : <Save data-icon="inline-start" />}{saved ? "Saved" : "Save"}</Button></div><Textarea value={value} onChange={(e) => { setValue(e.target.value); setSaved(false) }} className="min-h-[32rem] font-mono text-sm leading-6" spellCheck={false} aria-label={`${type} editor`} />{error && <p className="text-sm text-destructive">{error}</p>}</div>
}
