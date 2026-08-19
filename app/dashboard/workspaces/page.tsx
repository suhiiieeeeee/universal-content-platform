import Link from "next/link"
import { redirect } from "next/navigation"
import { Layers, Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"

export default async function WorkspacesPage() {
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

  const profileForHeader = {
    displayName: profile?.display_name ?? null,
    username: profile?.username ?? "",
    avatarUrl: profile?.avatar_url ?? null,
  }

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader
        title="Workspaces"
        description="Organize collections and documents by team or project."
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
      <div className="flex flex-1 flex-col gap-4 p-6">
        {!workspaces || workspaces.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Layers />
              </EmptyMedia>
              <EmptyTitle>No workspaces yet</EmptyTitle>
              <EmptyDescription>Create your first workspace to get started.</EmptyDescription>
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((w) => (
              <Link key={w.id} href={`/dashboard/workspaces/${w.slug}`}>
                <Card className="h-full transition-colors hover:bg-accent/50">
                  <CardHeader>
                    <div className="mb-2 flex size-9 items-center justify-center rounded-md bg-secondary">
                      <Layers className="size-4 text-secondary-foreground" />
                    </div>
                    <CardTitle className="text-base">{w.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {w.description || `/${w.slug}`}
                    </CardDescription>
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
