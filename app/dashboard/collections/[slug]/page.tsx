import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function CollectionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) redirect("/login")
  const { data: profile } = await supabase.from("profiles").select("username, display_name, avatar_url").eq("id", auth.user.id).maybeSingle()
  const { data: collection } = await supabase.from("collections").select("id, name, slug, description").eq("user_id", auth.user.id).eq("slug", slug).maybeSingle()
  if (!collection) notFound()
  const { data: documents } = await supabase.from("documents").select("id, slug, status, visibility, updated_at").eq("user_id", auth.user.id).eq("collection_id", collection.id).order("updated_at", { ascending: false })
  return <div className="flex flex-1 flex-col"><DashboardHeader title={collection.name} description={collection.description ?? `Files in /${collection.slug}`} profile={{ displayName: profile?.display_name ?? null, username: profile?.username ?? "", avatarUrl: profile?.avatar_url ?? null }} /><main className="flex flex-1 flex-col gap-6 p-6"><Card><CardHeader><CardTitle className="text-base">Files</CardTitle></CardHeader><CardContent className="flex flex-col gap-2">{!documents?.length ? <p className="text-sm text-muted-foreground">No files in this collection yet.</p> : documents.map((document) => <div key={document.id} className="flex items-center justify-between rounded-md border border-border p-3"><span className="font-mono text-sm">{document.slug}</span><span className="text-xs capitalize text-muted-foreground">{document.status} · {document.visibility}</span></div>)}</CardContent></Card><Link href="/dashboard/files" className="text-sm text-muted-foreground hover:text-foreground">Back to files</Link></main></div>
}
