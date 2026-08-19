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

  const slug = slugify(name)
  if (slug.length < 2) return { ok: false, error: "Please choose a workspace name with at least 2 letters or numbers." }

  const { data, error } = await supabase.rpc("create_workspace", {
    workspace_name: name,
    workspace_slug: slug,
    workspace_description: description,
  })

  if (!error && data) {
    revalidatePath("/dashboard/workspaces")
    return { ok: true, data: { slug: data.slug } }
  }

  if (error?.code === "23505") return { ok: false, error: "That workspace URL is already in use." }
  if (error?.code === "42501" || error?.message?.toLowerCase().includes("not authenticated")) {
    return { ok: false, error: "Please sign in before creating a workspace." }
  }
  if (error?.code === "22023") return { ok: false, error: "Please check the workspace name and URL." }
  return { ok: false, error: "Unable to create workspace. Please check the workspace name and try again." }
}

export async function updateWorkspace(workspaceId: string, formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return { ok: false, error: "Not authenticated." }
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
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return { ok: false, error: "Not authenticated." }
  const { error } = await supabase.from("workspaces").delete().eq("id", workspaceId)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/dashboard/workspaces")
  return { ok: true }
}
