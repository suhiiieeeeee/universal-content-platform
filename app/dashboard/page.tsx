import Link from "next/link"
import { redirect } from "next/navigation"
import { Layers, FileText, Plus, ArrowUpRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"
import { Badge } from "@/components/ui/badge"

export default async function DashboardOverviewPage() {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url")
    .eq("id", authData.user.id)
    .maybeSingle()

  const { data: workspaces } = await supabase
    .from("workspaces")
    .select("id, name, slug, description, created_at")
    .order("created_at", { ascending: true })

  const workspaceIds = (workspaces ?? []).map((w) => w.id)

  let collectionCount = 0
  let documentCount = 0
  let recentCollections: { id: string; name: string; slug: string; workspace_slug: string; workspace_name: string }[] = []

  if (workspaceIds.length > 0) {
    const { count: cCount } = await supabase
      .from("collections")
      .select("*", { count: "exact", head: true })
      .in("workspace_id", workspaceIds)
    collectionCount = cCount ?? 0

    const { data: collectionRows } = await supabase
      .from("collections")
      .select("id, name, slug, workspace_id, created_at, workspaces(name, slug)")
      .in("workspace_id", workspaceIds)
      .order("created_at", { ascending: false })
      .limit(5)

    recentCollections = (collectionRows ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      workspace_slug: c.workspaces?.slug ?? "",
      workspace_name: c.workspaces?.name ?? "",
    }))

    const collectionIds = (collectionRows ?? []).map((c: any) => c.id)
    if (collectionIds.length > 0) {
      const { count: dCount } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .in("collection_id", collectionIds)
      documentCount = dCount ?? 0
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
        title={`Welcome back${profile?.display_name ? `, ${profile.display_name}` : ""}`}
        description="Here's what's happening across your workspaces."
        profile={profileForHeader}
        actions={
          <Button asChild size="sm">
            <Link href="/dashboard/workspaces/new">
              <Plus data-icon="inline-start" />
              New workspace
            </Link>
          </Button>
        }
      />

      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Workspaces</CardDescription>
              <CardTitle className="font-mono text-3xl">{workspaces?.length ?? 0}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Collections</CardDescription>
              <CardTitle className="font-mono text-3xl">{collectionCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Documents</CardDescription>
              <CardTitle className="font-mono text-3xl">{documentCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {!workspaces || workspaces.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Layers />
              </EmptyMedia>
              <EmptyTitle>No workspaces yet</EmptyTitle>
              <EmptyDescription>
                Create a workspace to start organizing collections and documents.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild>
                <Link href="/dashboard/workspaces/new">
                  <Plus data-icon="inline-start" />
                  Create workspace
                </Link>
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your workspaces</CardTitle>
                <CardDescription>Jump back into a workspace.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {workspaces.map((w) => (
                  <Link
                    key={w.id}
                    href={`/dashboard/workspaces/${w.slug}`}
                    className="group flex items-center justify-between rounded-md border border-border p-3 transition-colors hover:bg-accent"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-md bg-secondary">
                        <Layers className="size-4 text-secondary-foreground" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{w.name}</span>
                        <span className="text-xs text-muted-foreground">/{w.slug}</span>
                      </div>
                    </div>
                    <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent collections</CardTitle>
                <CardDescription>Recently created collections across your workspaces.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {recentCollections.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No collections yet.</p>
                ) : (
                  recentCollections.map((c) => (
                    <Link
                      key={c.id}
                      href={`/dashboard/workspaces/${c.workspace_slug}/collections/${c.slug}`}
                      className="group flex items-center justify-between rounded-md border border-border p-3 transition-colors hover:bg-accent"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-md bg-secondary">
                          <FileText className="size-4 text-secondary-foreground" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{c.name}</span>
                          <Badge variant="outline" className="w-fit text-[10px]">
                            {c.workspace_name}
                          </Badge>
                        </div>
                      </div>
                      <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
