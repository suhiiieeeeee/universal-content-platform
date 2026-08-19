import { redirect } from "next/navigation"
import { Upload } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ImportPanel } from "@/components/dashboard/import-panel"

export default async function ImportsPage() {
  const supabase = await createClient(); const { data: auth } = await supabase.auth.getUser(); if (!auth.user) redirect("/login")
  const { data: profile } = await supabase.from("profiles").select("username, display_name, avatar_url").eq("id", auth.user.id).maybeSingle()
  return <div className="flex flex-1 flex-col"><DashboardHeader title="Imports" description="Bring JSON, Markdown, and CSV content into your library." profile={{ displayName: profile?.display_name ?? null, username: profile?.username ?? "", avatarUrl: profile?.avatar_url ?? null }} /><main className="flex flex-1 flex-col gap-6 p-6"><Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Upload className="size-4 text-primary" />Import content</CardTitle><CardDescription>Preview and choose a destination before anything is written.</CardDescription></CardHeader><CardContent><ImportPanel /></CardContent></Card></main></div>
}
