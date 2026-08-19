import { redirect } from "next/navigation"
import { FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"

export default async function FilesPage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) redirect("/login")
  const { data: profile } = await supabase.from("profiles").select("username, display_name, avatar_url").eq("id", auth.user.id).maybeSingle()
  const { data: documents } = await supabase.from("documents").select("id, slug, status, visibility, updated_at, collections(name, slug)").eq("user_id", auth.user.id).order("updated_at", { ascending: false }).limit(100)
  return <div className="flex flex-1 flex-col"><DashboardHeader title="Files" description="Browse and manage every document you own." profile={{ displayName: profile?.display_name ?? null, username: profile?.username ?? "", avatarUrl: profile?.avatar_url ?? null }} /><main className="flex flex-1 flex-col gap-6 p-6"><Card><CardHeader><CardTitle className="text-base">All files</CardTitle><CardDescription>{documents?.length ?? 0} files in your library.</CardDescription></CardHeader><CardContent>{!documents?.length ? <Empty className="border border-dashed"><EmptyHeader><EmptyMedia variant="icon"><FileText /></EmptyMedia><EmptyTitle>No files yet</EmptyTitle><EmptyDescription>Create a collection first, then add documents from its editor.</EmptyDescription></EmptyHeader></Empty> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{documents.map((document: any) => <div key={document.id} className="rounded-lg border border-border p-4"><div className="flex items-center justify-between gap-3"><span className="truncate font-mono text-sm font-medium">{document.slug}</span><span className="text-xs capitalize text-muted-foreground">{document.status}</span></div><p className="mt-2 text-xs text-muted-foreground">{document.collections?.name ?? "Unfiled"} · {document.visibility}</p></div>)}</div>}</CardContent></Card></main></div>
}
