import { redirect } from "next/navigation"
import { Activity } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ActivityPage() {
  const supabase = await createClient(); const { data: auth } = await supabase.auth.getUser(); if (!auth.user) redirect("/login")
  const { data: profile } = await supabase.from("profiles").select("username, display_name, avatar_url").eq("id", auth.user.id).maybeSingle()
  const { data: logs } = await supabase.from("audit_logs").select("id, action, resource_type, created_at").eq("user_id", auth.user.id).order("created_at", { ascending: false }).limit(50)
  return <div className="flex flex-1 flex-col"><DashboardHeader title="Activity" description="A private timeline of changes to your content." profile={{ displayName: profile?.display_name ?? null, username: profile?.username ?? "", avatarUrl: profile?.avatar_url ?? null }} /><main className="flex flex-1 flex-col gap-6 p-6"><Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Activity className="size-4 text-primary" />Recent activity</CardTitle><CardDescription>{logs?.length ?? 0} recorded events.</CardDescription></CardHeader><CardContent className="flex flex-col gap-2">{!logs?.length ? <p className="text-sm text-muted-foreground">No activity yet.</p> : logs.map((log) => <div key={log.id} className="flex items-center justify-between rounded-md border border-border p-3 text-sm"><span>{log.action}{log.resource_type ? ` · ${log.resource_type}` : ""}</span><time className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</time></div>)}</CardContent></Card></main></div>
}
