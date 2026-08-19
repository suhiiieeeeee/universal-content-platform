"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export interface ActionResult<T = undefined> {
  ok: boolean
  error?: string
  data?: T
}

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

export async function createWorkspace(formData: FormData): Promise<ActionResult<{ slug: string }>> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return { ok: false, error: "Not authenticated." }

  const name = String(formData.get("name") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim() || null
  if (name.length < 2) return { ok: false, error: "Name must be at least 2 characters." }

  let slug = slugify(name)
  if (slug.length < 2) slug = `workspace-${Date.now().toString(36)}`

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = attempt === 0 ? slug : `${slug}-${attempt}`
    const { data, error } = await supabase
      .from("workspaces")
      .insert({ name, slug: candidate, description, owner_id: authData.user.id })
      .select("slug")
      .single()

    if (!error && data) {
      revalidatePath("/dashboard/workspaces")
      return { ok: true, data: { slug: data.slug } }
    }
    if (error && error.code !== "23505") {
      return { ok: false, error: error.message }
    }
  }
  return { ok: false, error: "Could not generate a unique workspace URL. Try a different name." }
}

export async function updateWorkspace(workspaceId: string, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const name = String(formData.get("name") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim() || null
  if (name.length < 2) return { ok: false, error: "Name must be at least 2 characters." }

  const { error } = await supabase.from("workspaces").update({ name, description }).eq("id", workspaceId)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/dashboard/workspaces")
  return { ok: true }
}

export async function deleteWorkspace(workspaceId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from("workspaces").delete().eq("id", workspaceId)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/dashboard/workspaces")
  return { ok: true }
}
