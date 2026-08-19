import { redirect } from "next/navigation"
import Link from "next/link"
import { FileText, Upload } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { NewFileDialog } from "@/components/dashboard/new-file-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"

export default async function FilesPage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) redirect("/login")
  const [{ data: profile }, { data: documents }] = await Promise.all([
    supabase.from("profiles").select("username, display_name, avatar_url").eq("id", auth.user.id).maybeSingle(),
    supabase.from("documents").select("id, slug, title, type, status, visibility, updated_at").eq("user_id", auth.user.id).order("updated_at", { ascending: false }).limit(100),
  ])
  return <div className="flex flex-1 flex-col"><DashboardHeader title="Files" description="Manage your JSON and Markdown content." profile={{ displayName: profile?.display_name ?? null, username: profile?.username ?? "", avatarUrl: profile?.avatar_url ?? null }} /><main className="flex flex-1 flex-col gap-6 p-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">All files</h2><p className="text-sm text-muted-foreground">{documents?.length ?? 0} files in your library.</p></div><div className="flex gap-2"><Button variant="outline" asChild><Link href="/dashboard/imports"><Upload data-icon="inline-start" />Import</Link></Button><NewFileDialog /></div></div><Card><CardHeader><CardTitle className="text-base">Your content</CardTitle><CardDescription>Open a file to edit, save, publish, or export it.</CardDescription></CardHeader><CardContent>{!documents?.length ? <Empty className="border border-dashed"><EmptyHeader><EmptyMedia variant="icon"><FileText /></EmptyMedia><EmptyTitle>No files yet</EmptyTitle><EmptyDescription>Create your first JSON or Markdown file.</EmptyDescription></EmptyHeader><div className="flex gap-2"><NewFileDialog /><Button variant="outline" asChild><Link href="/dashboard/imports">Import</Link></Button></div></Empty> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{documents.map((document) => <Link href={`/dashboard/files/${document.id}`} key={document.id} className="rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"><div className="flex items-center justify-between gap-3"><span className="truncate font-mono text-sm font-medium">{document.title ?? document.slug}</span><span className="text-xs uppercase text-muted-foreground">{document.type ?? "json"}</span></div><p className="mt-2 text-xs capitalize text-muted-foreground">{document.status} · {document.visibility}</p><p className="mt-1 text-xs text-muted-foreground">Updated {new Date(document.updated_at).toLocaleDateString()}</p></Link>)}</div>}</CardContent></Card></main></div>
}
