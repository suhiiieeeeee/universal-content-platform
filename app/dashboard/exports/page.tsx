import { redirect } from "next/navigation"
import { Download } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ExportList } from "@/components/dashboard/export-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ExportsPage() {
  const supabase = await createClient(); const { data: auth } = await supabase.auth.getUser(); if (!auth.user) redirect("/login")
  const [{ data: profile }, { data: documents }] = await Promise.all([supabase.from("profiles").select("username, display_name, avatar_url").eq("id", auth.user.id).maybeSingle(), supabase.from("documents").select("title, slug, type, data").eq("user_id", auth.user.id).order("updated_at", { ascending: false })])
  return <div className="flex flex-1 flex-col"><DashboardHeader title="Exports" description="Download your current content in portable formats." profile={{ displayName: profile?.display_name ?? null, username: profile?.username ?? "", avatarUrl: profile?.avatar_url ?? null }} /><main className="flex flex-1 flex-col gap-6 p-6"><Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Download className="size-4 text-primary" />Export library</CardTitle><CardDescription>Exports are generated from the latest Supabase data.</CardDescription></CardHeader><CardContent>{documents?.length ? <ExportList documents={documents as any} /> : <p className="text-sm text-muted-foreground">No files to export yet. Create a file first.</p>}</CardContent></Card></main></div>
}
