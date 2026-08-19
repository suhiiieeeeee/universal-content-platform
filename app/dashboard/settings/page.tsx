import { createClient } from "@/lib/supabase/server"
import { SettingsPanel } from "@/components/dashboard/settings-panel"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return null

  const [{ data: profile }, { data: preferences }] = await Promise.all([
    supabase.from("profiles").select("username, display_name, bio").eq("id", userData.user.id).maybeSingle(),
    supabase.from("user_preferences").select("theme, color_mode, editor_mode, sidebar_collapsed, font_size, reduced_motion").eq("user_id", userData.user.id).maybeSingle(),
  ])

  return (
    <main className="flex min-h-full flex-col gap-8 p-6 md:p-10">
      <header className="flex flex-col gap-2">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-muted-foreground">Workspace control plane</p>
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">Manage your profile and the preferences that follow you across devices.</p>
      </header>
      <SettingsPanel
        email={userData.user.email ?? ""}
        profile={profile}
        preferences={preferences}
      />
    </main>
  )
}
