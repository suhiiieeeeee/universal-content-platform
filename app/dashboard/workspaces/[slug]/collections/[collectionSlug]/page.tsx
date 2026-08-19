import { notFound, redirect } from "next/navigation"
import { FileText } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SchemaEditor } from "@/components/dashboard/schema-editor"
import { DocumentFormDialog } from "@/components/dashboard/document-form-dialog"
import { DocumentsTable } from "@/components/dashboard/documents-table"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"
import type { SchemaField } from "@/lib/types"

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ slug: string; collectionSlug: string }>
}) {
  const { slug, collectionSlug } = await params
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
    .select("id, slug, name")
    .eq("slug", slug)
    .maybeSingle()
  if (!workspace) notFound()

  const { data: collection } = await supabase
    .from("collections")
    .select("id, name, slug, description, schema_id")
    .eq("workspace_id", workspace.id)
    .eq("slug", collectionSlug)
    .maybeSingle()
  if (!collection) notFound()

  let schemaFields: SchemaField[] = []
  let schemaName = ""
  if (collection.schema_id) {
    const { data: schema } = await supabase
      .from("schemas")
      .select("name, fields")
      .eq("id", collection.schema_id)
      .maybeSingle()
    if (schema) {
      schemaName = schema.name
      schemaFields = (schema.fields as SchemaField[]) ?? []
    }
  }

  const { data: documents } = await supabase
    .from("documents")
    .select("id, slug, status, visibility, version_count, updated_at")
    .eq("collection_id", collection.id)
    .order("updated_at", { ascending: false })

  const profileForHeader = {
    displayName: profile?.display_name ?? null,
    username: profile?.username ?? "",
    avatarUrl: profile?.avatar_url ?? null,
  }

  return (
    <div className="flex flex-1 flex-col">
      <DashboardHeader
        title={collection.name}
        description={collection.description ?? `${workspace.name} / ${collection.slug}`}
        profile={profileForHeader}
        actions={
          <>
            <SchemaEditor
              workspaceId={workspace.id}
              collectionId={collection.id}
              schemaId={collection.schema_id}
              schemaName={schemaName}
              initialFields={schemaFields}
            />
            <DocumentFormDialog
              collectionId={collection.id}
              workspaceSlug={workspace.slug}
              collectionSlug={collection.slug}
              fields={schemaFields}
            />
          </>
        }
      />
      <div className="flex flex-1 flex-col gap-4 p-6">
        {!documents || documents.length === 0 ? (
          <Empty className="border border-dashed">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileText />
              </EmptyMedia>
              <EmptyTitle>No documents yet</EmptyTitle>
              <EmptyDescription>
                {schemaFields.length === 0
                  ? "Define a schema first, then create your first document."
                  : "Create your first document in this collection."}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <DocumentFormDialog
                collectionId={collection.id}
                workspaceSlug={workspace.slug}
                collectionSlug={collection.slug}
                fields={schemaFields}
              />
            </EmptyContent>
          </Empty>
        ) : (
          <div className="rounded-md border border-border">
            <DocumentsTable documents={documents} workspaceSlug={workspace.slug} collectionSlug={collection.slug} />
          </div>
        )}
      </div>
    </div>
  )
}
