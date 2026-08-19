"use client"

import { useState } from "react"
import { Check, Copy, ExternalLink, Terminal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ApiExplorer({ endpoints }: { endpoints: { label: string; path: string; count: number }[] }) {
  const [selected, setSelected] = useState(endpoints[0]?.path ?? "")
  const [response, setResponse] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const endpoint = selected
  const code = `const response = await fetch("${endpoint}")\nconst { data } = await response.json()`
  async function copy(value: string) { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500) }
  async function execute() { if (!endpoint) return; const result = await fetch(endpoint); setResponse(JSON.stringify(await result.json(), null, 2)) }
  if (!endpoints.length) return <Card><CardContent className="flex flex-col gap-2 p-8"><CardTitle className="text-base">No public endpoints yet.</CardTitle><CardDescription>Publish a file and make it public to generate an API endpoint.</CardDescription><Button asChild className="mt-3 w-fit"><a href="/dashboard/files">View files</a></Button></CardContent></Card>
  return <div className="flex flex-col gap-4 md:flex-row"><Card className="md:w-80"><CardHeader><CardTitle className="text-base">Public endpoints</CardTitle></CardHeader><CardContent className="flex flex-col gap-2">{endpoints.map((item) => <button key={item.path} onClick={() => { setSelected(item.path); setResponse(null) }} className={`flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm ${selected === item.path ? "border-primary bg-accent" : "border-border"}`}><span className="min-w-0 truncate font-mono">GET {item.path}</span><Badge variant="secondary">{item.count}</Badge></button>)}</CardContent></Card><Card className="min-w-0 flex-1"><CardHeader><div className="flex items-center justify-between gap-4"><div><CardTitle className="flex items-center gap-2 text-base"><Terminal className="size-4 text-primary" />{endpoint}</CardTitle><CardDescription>Only published public content is returned.</CardDescription></div><Badge variant="secondary">GET</Badge></div></CardHeader><CardContent className="flex flex-col gap-4"><div className="flex gap-2"><Button onClick={execute}><ExternalLink data-icon="inline-start" />Execute request</Button><Button variant="outline" onClick={() => copy(endpoint)}>{copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}Copy endpoint</Button></div>{response && <pre className="max-h-80 overflow-auto rounded-lg bg-secondary p-4 font-mono text-xs leading-6"><code>{response}</code></pre>}<div className="flex items-start justify-between gap-3 rounded-lg bg-primary p-4 text-primary-foreground"><pre className="min-w-0 overflow-x-auto font-mono text-xs leading-6"><code>{code}</code></pre><Button size="icon" variant="secondary" aria-label="Copy JavaScript example" onClick={() => copy(code)}>{copied ? <Check /> : <Copy />}</Button></div></CardContent></Card></div>
}
