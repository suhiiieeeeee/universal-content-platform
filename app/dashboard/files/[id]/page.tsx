import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StandaloneFileEditor } from "@/components/dashboard/standalone-file-editor"
import { Button } from "@/components/ui/button"

export default async function FilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) redirect("/login")
  const [{ data: profile }, { data: document }] = await Promise.all([
    supabase.from("profiles").select("username, display_name, avatar_url").eq("id", auth.user.id).maybeSingle(),
    supabase.from("documents").select("id, slug, title, type, data, status, visibility").eq("id", id).eq("user_id", auth.user.id).maybeSingle(),
  ])
  if (!document) notFound()
  const type = document.type === "markdown" ? "markdown" : "json"
  return <div className="flex flex-1 flex-col"><DashboardHeader title={document.title ?? document.slug} description={`${type.toUpperCase()} file`} profile={{ displayName: profile?.display_name ?? null, username: profile?.username ?? "", avatarUrl: profile?.avatar_url ?? null }} /><main className="flex flex-1 flex-col gap-6 p-6"><div><Button variant="ghost" size="sm" asChild><Link href="/dashboard/files">Back to files</Link></Button></div><StandaloneFileEditor documentId={document.id} type={type} initialData={(document.data ?? {}) as Record<string, unknown>} initialStatus={document.status} initialVisibility={document.visibility} /></main></div>
}
