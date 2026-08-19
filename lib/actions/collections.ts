"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { ActionResult } from "@/lib/actions/result"
import type { SchemaField } from "@/lib/types"

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64)
}

export async function createCollection(
  formData: FormData,
): Promise<ActionResult<{ slug: string }>> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return { ok: false, error: "Not authenticated." }
  const name = String(formData.get("name") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim() || null
  const defaultVisibility = String(formData.get("default_visibility") ?? "private")
  if (name.length < 2) return { ok: false, error: "Name must be at least 2 characters." }

  let slug = slugify(name)
  if (slug.length < 2) slug = `collection-${Date.now().toString(36)}`

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = attempt === 0 ? slug : `${slug}-${attempt}`
    const { data, error } = await supabase
      .from("collections")
      .insert({
        user_id: authData.user.id,
        name,
        slug: candidate,
        description,
        default_visibility: defaultVisibility,
      })
      .select("slug")
      .single()

    if (!error && data) {
      revalidatePath("/dashboard")
  revalidatePath("/dashboard/collections")
  revalidatePath("/dashboard/files")
      return { ok: true, data: { slug: data.slug } }
    }
    if (error && error.code !== "23505") {
      return { ok: false, error: error.message }
    }
  }
  return { ok: false, error: "Could not generate a unique collection URL. Try a different name." }
}

export async function updateCollection(collectionId: string, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return { ok: false, error: "Not authenticated." }
  const name = String(formData.get("name") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim() || null
  const defaultVisibility = String(formData.get("default_visibility") ?? "private")
  if (name.length < 2) return { ok: false, error: "Name must be at least 2 characters." }

  const { error } = await supabase
    .from("collections")
    .update({ name, description, default_visibility: defaultVisibility })
    .eq("id", collectionId)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/collections")
  revalidatePath("/dashboard/files")
  return { ok: true }
}

export async function deleteCollection(collectionId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return { ok: false, error: "Not authenticated." }
  const { error } = await supabase.from("collections").delete().eq("id", collectionId)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/collections")
  revalidatePath("/dashboard/files")
  return { ok: true }
}

export async function duplicateCollection(collectionId: string): Promise<ActionResult<{ slug: string }>> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return { ok: false, error: "Not authenticated." }
  const { data: original, error: fetchError } = await supabase
    .from("collections")
    .select("*")
    .eq("id", collectionId)
    .single()
  if (fetchError || !original) return { ok: false, error: fetchError?.message ?? "Collection not found." }

  let slug = `${original.slug}-copy`
  let inserted: { id: string; slug: string } | null = null
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = attempt === 0 ? slug : `${slug}-${attempt}`
    const { data, error } = await supabase
      .from("collections")
      .insert({
        user_id: authData.user.id,
        name: `${original.name} Copy`,
        slug: candidate,
        description: original.description,
        schema_id: original.schema_id,
        default_visibility: original.default_visibility,
      })
      .select("id, slug")
      .single()
    if (!error && data) {
      inserted = data
      break
    }
    if (error && error.code !== "23505") return { ok: false, error: error.message }
  }
  if (!inserted) return { ok: false, error: "Could not duplicate collection." }

  const { data: docs } = await supabase.from("documents").select("slug, title, data, status, visibility, type").eq("collection_id", collectionId)
  if (docs && docs.length > 0) {
    await supabase.from("documents").insert(
      docs.map((d) => ({
        user_id: authData.user.id,
        collection_id: inserted!.id,
        slug: d.slug,
        title: d.title,
        name: d.title,
        type: d.type ?? "json",
        data: d.data,
        status: "draft",
        visibility: d.visibility,
      })),
    )
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/collections")
  revalidatePath("/dashboard/files")
  return { ok: true, data: { slug: inserted.slug } }
}

export async function saveSchema(
  collectionId: string,
  name: string,
  fields: SchemaField[],
  schemaId?: string | null,
): Promise<ActionResult<{ schemaId: string }>> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return { ok: false, error: "Not authenticated." }

  if (schemaId) {
    const { error } = await supabase.from("schemas").update({ name, fields }).eq("id", schemaId)
    if (error) return { ok: false, error: error.message }
    revalidatePath("/dashboard")
  revalidatePath("/dashboard/collections")
  revalidatePath("/dashboard/files")
    return { ok: true, data: { schemaId } }
  }

  const { data, error } = await supabase
    .from("schemas")
    .insert({ user_id: authData.user.id, name, fields })
    .select("id")
    .single()
  if (error || !data) return { ok: false, error: error?.message ?? "Could not create schema." }

  const { error: linkError } = await supabase.from("collections").update({ schema_id: data.id }).eq("id", collectionId)
  if (linkError) return { ok: false, error: linkError.message }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/collections")
  revalidatePath("/dashboard/files")
  return { ok: true, data: { schemaId: data.id } }
}

export async function removeSchema(collectionId: string, schemaId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return { ok: false, error: "Not authenticated." }
  const { error: unlinkError } = await supabase.from("collections").update({ schema_id: null }).eq("id", collectionId)
  if (unlinkError) return { ok: false, error: unlinkError.message }
  await supabase.from("schemas").delete().eq("id", schemaId)
  revalidatePath("/dashboard")
  revalidatePath("/dashboard/collections")
  revalidatePath("/dashboard/files")
  return { ok: true }
}
