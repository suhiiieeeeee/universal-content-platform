import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { FileText, Layers } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { NewCollectionDialog } from "@/components/dashboard/new-collection-dialog"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"

export default async function WorkspaceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url")
    .eq("id", authData.user.id)
    .maybeSingle()

  const { data: workspace } = await supabase
    .from("workspaces")
    .select("id, name, slug, description")
    .eq("slug", slug)
    .maybeSingle()

  if (!workspace) notFound()

  const { data: collections } = await supabase
    .from("collections")
    .select("id, name, slug, description, default_visibility, schema_id")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: true })

  const collectionIds = (collections ?? []).map((c) => c.id)
  const docCounts = new Map<string, number>()
  if (collectionIds.length > 0) {
    const { data: docs } = await supabase.from("documents").select("collection_id").in("collection_id", collectionIds)
    for (const d of docs ?? []) {
      docCounts.set(d.collection_id, (docCounts.get(d.collection_id) ?? 0) + 1)
    }
  }

  const profileForHeader = {
    displayName: profile?.display_name ?? null,
    username: profile?.username ?? "",
    avatarUrl: profile?.avatar_url ?? null,
  }

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader
        title={workspace.name}
        description={workspace.description ?? `/${workspace.slug}`}
        profile={profileForHeader}
        actions={
          <NewCollectionDialog workspaceId={workspace.id} workspaceSlug={workspace.slug} />
        }
      />
      <div className="flex flex-1 flex-col gap-4 p-6">
        {!collections || collections.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Layers />
              </EmptyMedia>
              <EmptyTitle>No collections yet</EmptyTitle>
              <EmptyDescription>Create a collection to start adding structured documents.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <NewCollectionDialog workspaceId={workspace.id} workspaceSlug={workspace.slug} />
            </EmptyContent>
          </Empty>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((c) => (
              <Link key={c.id} href={`/dashboard/workspaces/${workspace.slug}/collections/${c.slug}`}>
                <Card className="h-full transition-colors hover:bg-accent/50">
                  <CardHeader>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex size-9 items-center justify-center rounded-md bg-secondary">
                        <FileText className="size-4 text-secondary-foreground" />
                      </div>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {c.default_visibility}
                      </Badge>
                    </div>
                    <CardTitle className="text-base">{c.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{c.description || `/${c.slug}`}</CardDescription>
                    <p className="pt-1 text-xs text-muted-foreground">
                      {docCounts.get(c.id) ?? 0} document{(docCounts.get(c.id) ?? 0) === 1 ? "" : "s"}
                      {!c.schema_id && " · no schema"}
                    </p>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
