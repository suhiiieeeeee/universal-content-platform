import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: Request, { params }: { params: Promise<{ username: string; collectionSlug: string }> }) {
  const { username, collectionSlug } = await params
  const url = new URL(request.url)
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") ?? 20) || 20, 1), 100)
  const supabase = createAdminClient()
  const { data: profile } = await supabase.from("profiles").select("id, username").eq("username", username).maybeSingle()
  if (!profile) return NextResponse.json({ error: "User not found" }, { status: 404 })
  const { data: collection } = await supabase.from("collections").select("id, name, slug").eq("user_id", profile.id).eq("slug", collectionSlug).maybeSingle()
  if (!collection) {
    const { data: document } = await supabase.from("documents").select("id, slug, data, status, visibility, created_at, updated_at, published_at").eq("user_id", profile.id).is("collection_id", null).eq("slug", collectionSlug).eq("status", "published").eq("visibility", "public").maybeSingle()
    if (!document) return NextResponse.json({ error: "Collection or document not found" }, { status: 404 })
    return NextResponse.json({ data: [document], meta: { username, document: document.slug, count: 1 } }, { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=120" } })
  }
  const { data, error } = await supabase.from("documents").select("id, slug, data, status, visibility, created_at, updated_at, published_at").eq("user_id", profile.id).eq("collection_id", collection.id).eq("status", "published").eq("visibility", "public").order("updated_at", { ascending: false }).limit(limit)
  if (error) return NextResponse.json({ error: "Unable to load content" }, { status: 500 })
  return NextResponse.json({ data: data ?? [], meta: { username, collection: collection.slug, count: data?.length ?? 0 } }, { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=120" } })
}
