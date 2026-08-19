import Link from "next/link"
import { Code2, Copy, ExternalLink, Terminal } from "lucide-react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default async function ApiPage() {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) redirect("/login")
  const { data: profile } = await supabase.from("profiles").select("username, display_name, avatar_url").eq("id", authData.user.id).maybeSingle()
  const { data: collection } = await supabase.from("collections").select("name, slug").eq("user_id", authData.user.id).order("created_at", { ascending: true }).limit(1).maybeSingle()
  const username = profile?.username ?? "username"
  const endpoint = collection ? `/api/v1/u/${username}/${collection.slug}` : `/api/v1/u/${username}/{collection}`
  return <div className="flex flex-1 flex-col"><DashboardHeader title="API explorer" description="Connect your frontend to your published content." profile={{ displayName: profile?.display_name ?? null, username, avatarUrl: profile?.avatar_url ?? null }} /><div className="flex flex-1 flex-col gap-6 p-6"><Card><CardHeader><div className="flex items-center justify-between gap-4"><div><CardTitle className="flex items-center gap-2 text-base"><Terminal className="size-4 text-primary" /> Public content endpoint</CardTitle><CardDescription className="mt-1">Only published public documents are returned.</CardDescription></div><Badge variant="secondary">GET</Badge></div></CardHeader><CardContent className="flex flex-col gap-4"><div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-secondary/50 px-4 py-3 font-mono text-sm"><span className="truncate text-muted-foreground">{endpoint}</span><Button size="icon" variant="ghost" aria-label="Copy endpoint"><Copy /></Button></div><pre className="overflow-x-auto rounded-lg bg-primary p-4 font-mono text-xs leading-6 text-primary-foreground"><code>{`const response = await fetch("${endpoint}")\nconst { data } = await response.json()`}</code></pre><div className="flex flex-wrap gap-2"><Button variant="outline" asChild><Link href={collection ? endpoint : "/dashboard/collections"} target="_blank"><ExternalLink data-icon="inline-start" />Try endpoint</Link></Button><Button variant="ghost" asChild><Link href="/dashboard/collections"><Code2 data-icon="inline-start" />Manage collections</Link></Button></div></CardContent></Card></div></div>
}
