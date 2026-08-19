import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: Promise<{ workspaceSlug: string; collectionSlug: string }> }) {
  const { workspaceSlug, collectionSlug } = await params
  const url = new URL(request.url)
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 20) || 20, 1), 100)
  const supabase = await createClient()
  const { data: workspace } = await supabase.from("workspaces").select("id, name, slug").eq("slug", workspaceSlug).maybeSingle()
  if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
  const { data: collection } = await supabase.from("collections").select("id, name, slug").eq("workspace_id", workspace.id).eq("slug", collectionSlug).maybeSingle()
  if (!collection) return NextResponse.json({ error: "Collection not found" }, { status: 404 })
  const { data, error } = await supabase.from("documents").select("id, slug, title, data, status, visibility, created_at, updated_at, published_at").eq("collection_id", collection.id).eq("status", "published").in("visibility", ["public", "unlisted"]).order("updated_at", { ascending: false }).limit(limit)
  if (error) return NextResponse.json({ error: "Unable to load content" }, { status: 500 })
  return NextResponse.json({ data: data ?? [], meta: { workspace: workspace.slug, collection: collection.slug, count: data?.length ?? 0 } }, { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=120" } })
}
