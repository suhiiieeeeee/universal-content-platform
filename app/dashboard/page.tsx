import Link from "next/link"
import { redirect } from "next/navigation"
import { FileText, Layers, Plus, ArrowUpRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { NewFileDialog } from "@/components/dashboard/new-file-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"

export default async function DashboardOverviewPage() {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) redirect("/login")
  const { data: profile } = await supabase.from("profiles").select("username, display_name, avatar_url").eq("id", authData.user.id).maybeSingle()
  const { count: collectionCount } = await supabase.from("collections").select("id", { count: "exact", head: true }).eq("user_id", authData.user.id)
  const { count: documentCount } = await supabase.from("documents").select("id", { count: "exact", head: true }).eq("user_id", authData.user.id)
  const { data: collections } = await supabase.from("collections").select("id, name, slug, description, created_at").eq("user_id", authData.user.id).order("created_at", { ascending: false }).limit(5)
  const profileForHeader = { displayName: profile?.display_name ?? null, username: profile?.username ?? "", avatarUrl: profile?.avatar_url ?? null }
  return <div className="flex flex-1 flex-col">
    <DashboardHeader title={`Welcome back${profile?.display_name ? `, ${profile.display_name}` : ""}`} description="Your files and collections, in one focused workspace." profile={profileForHeader} actions={<NewFileDialog />} />
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="grid gap-4 sm:grid-cols-2"><Card><CardHeader className="pb-2"><CardDescription>Collections</CardDescription><CardTitle className="font-mono text-3xl">{collectionCount ?? 0}</CardTitle></CardHeader></Card><Card><CardHeader className="pb-2"><CardDescription>Files</CardDescription><CardTitle className="font-mono text-3xl">{documentCount ?? 0}</CardTitle></CardHeader></Card></div>
      {!collections?.length ? <Empty className="border border-dashed"><EmptyHeader><EmptyMedia variant="icon"><FileText /></EmptyMedia><EmptyTitle>Your files start here</EmptyTitle><EmptyDescription>Create a file directly. Collections are optional and can be added later.</EmptyDescription></EmptyHeader><EmptyContent><NewFileDialog /></EmptyContent></Empty> : <Card><CardHeader><CardTitle className="text-base">Recent collections</CardTitle><CardDescription>Keep your content organized without setup overhead.</CardDescription></CardHeader><CardContent className="flex flex-col gap-2">{collections.map((collection) => <Link key={collection.id} href={`/dashboard/collections/${collection.slug}`} className="group flex items-center justify-between rounded-md border border-border p-3 transition-colors hover:bg-accent"><div className="flex items-center gap-3"><div className="flex size-8 items-center justify-center rounded-md bg-secondary"><Layers className="size-4 text-secondary-foreground" /></div><div className="flex flex-col"><span className="text-sm font-medium">{collection.name}</span><span className="text-xs text-muted-foreground">/{collection.slug}</span></div></div><ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" /></Link>)}</CardContent></Card>}
    </div>
  </div>
}
