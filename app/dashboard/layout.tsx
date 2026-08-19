import type React from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: userData, error } = await supabase.auth.getUser()

  if (error || !userData?.user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio, created_at, updated_at")
    .eq("id", userData.user.id)
    .maybeSingle()

  return (
    <SidebarProvider>
      <AppSidebar user={{ email: userData.user.email ?? "", username: profile?.username ?? "", displayName: profile?.display_name ?? null }} />
      <SidebarInset className="min-w-0 bg-background">{children}</SidebarInset>
    </SidebarProvider>
  )
}
