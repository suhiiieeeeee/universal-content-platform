"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Upload } from "lucide-react"
import { importDocument } from "@/lib/actions/documents"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function ImportPanel() {
  const router = useRouter(); const [file, setFile] = useState<File | null>(null); const [preview, setPreview] = useState<string>(""); const [pending, setPending] = useState(false); const [error, setError] = useState<string | null>(null)
  async function inspect(next: File | null) { setFile(next); setError(null); if (!next) return; const text = await next.text(); setPreview(text.slice(0, 2000)) }
  async function submit() { if (!file) return; setPending(true); setError(null); const text = await file.text(); const type = file.name.toLowerCase().endsWith(".md") || file.name.toLowerCase().endsWith(".markdown") ? "markdown" : "json"; let data: Record<string, unknown>; if (type === "markdown") data = { content: text }; else { try { const parsed = JSON.parse(text); data = parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : { items: parsed } } catch { setPending(false); setError("The selected file is not valid JSON."); return } } const result = await importDocument(file.name.replace(/\.[^.]+$/, ""), type, data); setPending(false); if (!result.ok) return setError(result.error ?? "Import failed."); router.push(`/dashboard/files/${result.data.id}`); router.refresh() }
  return <Card><CardContent className="flex flex-col gap-4 p-6"><label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border p-8 text-center"><Upload className="size-5 text-primary" /><span className="text-sm font-medium">Choose JSON or Markdown</span><input type="file" accept=".json,.md,.markdown" className="sr-only" onChange={(e) => inspect(e.target.files?.[0] ?? null)} /></label>{file && <><p className="text-sm">Preview: <strong>{file.name}</strong></p><pre className="max-h-64 overflow-auto rounded-md bg-secondary p-3 text-xs">{preview}</pre><Button onClick={submit} disabled={pending}>{pending && <Loader2 className="animate-spin" data-icon="inline-start" />}Import file</Button></>}{error && <p className="text-sm text-destructive">{error}</p>}</CardContent></Card>
}
