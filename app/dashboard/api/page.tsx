import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ApiExplorer } from "@/components/dashboard/api-explorer"

export default async function ApiPage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()
  if (!auth.user) redirect("/login")
  const [{ data: profile }, { data: collections }, { data: standalone }] = await Promise.all([
    supabase.from("profiles").select("username, display_name, avatar_url").eq("id", auth.user.id).maybeSingle(),
    supabase.from("collections").select("slug, name, documents!inner(id)").eq("user_id", auth.user.id).eq("documents.user_id", auth.user.id).eq("documents.status", "published").eq("documents.visibility", "public"),
    supabase.from("documents").select("id, slug, title").eq("user_id", auth.user.id).is("collection_id", null).eq("status", "published").eq("visibility", "public"),
  ])
  const username = profile?.username ?? ""
  const endpoints = [...(collections ?? []).map((collection: any) => ({ label: collection.name, path: `/api/v1/u/${username}/${collection.slug}`, count: collection.documents?.length ?? 0 })), ...(standalone ?? []).map((document) => ({ label: document.title ?? document.slug, path: `/api/v1/u/${username}/${document.slug}`, count: 1 }))]
  return <div className="flex flex-1 flex-col"><DashboardHeader title="API explorer" description="Explore your published public content." profile={{ displayName: profile?.display_name ?? null, username, avatarUrl: profile?.avatar_url ?? null }} /><main className="flex flex-1 flex-col gap-6 p-6"><ApiExplorer endpoints={endpoints} /></main></div>
}
