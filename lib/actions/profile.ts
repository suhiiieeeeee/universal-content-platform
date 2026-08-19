"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { ActionResult } from "@/lib/actions/workspaces"

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData.user) return { ok: false, error: "Not authenticated." }

  const displayName = String(formData.get("display_name") ?? "").trim() || null
  const bio = String(formData.get("bio") ?? "").trim() || null
  const username = String(formData.get("username") ?? "")
    .trim()
    .toLowerCase()

  if (!/^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/.test(username)) {
    return { ok: false, error: "Username must be 3-32 characters: lowercase letters, numbers, and hyphens." }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName, bio, username })
    .eq("id", authData.user.id)

  if (error) {
    if (error.code === "23505") return { ok: false, error: "That username is already taken." }
    return { ok: false, error: error.message }
  }

  revalidatePath("/dashboard/settings")
  return { ok: true }
}

export async function updateEmail(newEmail: string, origin: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser(
    { email: newEmail },
    {
      emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${origin}/auth/callback`,
    },
  )
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function updatePassword(newPassword: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
