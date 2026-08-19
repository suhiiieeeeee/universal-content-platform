"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { ActionResult } from "@/lib/actions/workspaces"
import type { DocumentStatus, DocumentVisibility } from "@/lib/types"

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 96)
}

export async function createDocument(
  collectionId: string,
  slugInput: string,
  data: Record<string, unknown>,
  visibility: DocumentVisibility,
): Promise<ActionResult<{ slug: string }>> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return { ok: false, error: "Not authenticated." }

  let slug = slugify(slugInput) || `doc-${Date.now().toString(36)}`

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = attempt === 0 ? slug : `${slug}-${attempt}`
    const { data: inserted, error } = await supabase
      .from("documents")
      .insert({
        collection_id: collectionId,
        slug: candidate,
        data,
        visibility,
        created_by: authData.user.id,
        updated_by: authData.user.id,
      })
      .select("slug")
      .single()

    if (!error && inserted) {
      revalidatePath("/dashboard/workspaces")
      return { ok: true, data: { slug: inserted.slug } }
    }
    if (error && error.code !== "23505") return { ok: false, error: error.message }
  }
  return { ok: false, error: "Could not generate a unique document slug." }
}

export async function updateDocument(
  documentId: string,
  updates: {
    slug?: string
    data?: Record<string, unknown>
    status?: DocumentStatus
    visibility?: DocumentVisibility
  },
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return { ok: false, error: "Not authenticated." }

  // Snapshot the current state into document_versions before overwriting it.
  if (updates.data !== undefined) {
    const { data: current } = await supabase
      .from("documents")
      .select("data, status, visibility, version_count")
      .eq("id", documentId)
      .single()

    if (current) {
      const nextVersion = (current.version_count ?? 0) + 1
      const { error: versionError } = await supabase.from("document_versions").insert({
        document_id: documentId,
        version_number: nextVersion,
        data: current.data,
        status: current.status,
        visibility: current.visibility,
        created_by: authData.user.id,
      })
      if (!versionError) {
        ;(updates as Record<string, unknown>).version_count = nextVersion
      }
    }
  }

  const payload: Record<string, unknown> = { ...updates, updated_by: authData.user.id }
  if (updates.status === "published") payload.published_at = new Date().toISOString()
  if (updates.slug) payload.slug = slugify(updates.slug)

  const { error } = await supabase.from("documents").update(payload).eq("id", documentId)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/dashboard/workspaces")
  return { ok: true }
}

export async function deleteDocument(documentId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from("documents").delete().eq("id", documentId)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/dashboard/workspaces")
  return { ok: true }
}

export async function restoreDocumentVersion(documentId: string, versionId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: version, error: fetchError } = await supabase
    .from("document_versions")
    .select("data, status, visibility")
    .eq("id", versionId)
    .eq("document_id", documentId)
    .single()
  if (fetchError || !version) return { ok: false, error: fetchError?.message ?? "Version not found." }

  return updateDocument(documentId, {
    data: version.data as Record<string, unknown>,
    status: version.status,
    visibility: version.visibility,
  })
}
