import { redirect } from "next/navigation"
import { FolderOpen } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { NewCollectionDialog } from "@/components/dashboard/new-collection-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import Link from "next/link"

export default async function CollectionsPage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) redirect("/login")
  const { data: profile } = await supabase.from("profiles").select("username, display_name, avatar_url").eq("id", auth.user.id).maybeSingle()
  const { data: collections } = await supabase.from("collections").select("id, name, slug, description, created_at").eq("user_id", auth.user.id).order("created_at", { ascending: false })
  return <div className="flex flex-1 flex-col"><DashboardHeader title="Collections" description="Organize related files when your library grows." profile={{ displayName: profile?.display_name ?? null, username: profile?.username ?? "", avatarUrl: profile?.avatar_url ?? null }} actions={<NewCollectionDialog />} /><main className="flex flex-1 flex-col gap-6 p-6">{!collections?.length ? <Empty className="border border-dashed"><EmptyHeader><EmptyMedia variant="icon"><FolderOpen /></EmptyMedia><EmptyTitle>No collections yet</EmptyTitle><EmptyDescription>Create an optional collection to group related files.</EmptyDescription></EmptyHeader></Empty> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{collections.map((collection) => <Link key={collection.id} href={`/dashboard/collections/${collection.slug}`}><Card className="h-full transition-colors hover:bg-accent"><CardHeader><CardTitle className="text-base">{collection.name}</CardTitle><CardDescription>/{collection.slug}</CardDescription></CardHeader><CardContent><p className="line-clamp-2 text-sm text-muted-foreground">{collection.description ?? "No description"}</p></CardContent></Card></Link>)}</div>}</main></div>
}
