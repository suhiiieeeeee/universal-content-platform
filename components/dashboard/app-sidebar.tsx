"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Activity, Database, FileArchive, FileInput, FileText, LayoutGrid, LogOut, Settings, Webhook, Layers } from "lucide-react"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase/client"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/files", label: "Files", icon: FileText },
  { href: "/dashboard/collections", label: "Collections", icon: Layers },
  { href: "/dashboard/api", label: "API", icon: Webhook },
  { href: "/dashboard/imports", label: "Imports", icon: FileInput },
  { href: "/dashboard/exports", label: "Exports", icon: FileArchive },
  { href: "/dashboard/activity", label: "Activity", icon: Activity },
]

export function AppSidebar({ user }: { user: { email: string; username: string; displayName: string | null } }) {
  const pathname = usePathname()
  const router = useRouter()
  const handleLogout = async () => {
    await createClient().auth.signOut()
    router.push("/")
    router.refresh()
  }
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu><SidebarMenuItem><SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground"><Database className="size-3.5" /></div>
          <div className="flex flex-col leading-none"><span className="font-mono text-sm font-semibold">Datakit</span><span className="text-xs text-muted-foreground">@{user.username}</span></div>
        </SidebarMenuButton></SidebarMenuItem></SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-1 py-3"><SidebarGroup><SidebarGroupLabel>Library</SidebarGroupLabel><SidebarGroupContent><SidebarMenu>
        {NAV_ITEMS.map((item) => { const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href); return <SidebarMenuItem key={item.href}><SidebarMenuButton render={<Link href={item.href} />} isActive={active} tooltip={item.label}><item.icon /><span>{item.label}</span></SidebarMenuButton></SidebarMenuItem> })}
      </SidebarMenu></SidebarGroupContent></SidebarGroup></SidebarContent>
      <SidebarFooter><SidebarMenu>
        <SidebarMenuItem><SidebarMenuButton render={<Link href="/dashboard/settings" />} isActive={pathname.startsWith("/dashboard/settings")} tooltip="Settings"><Settings /><span>Settings</span></SidebarMenuButton></SidebarMenuItem>
        <SidebarMenuItem><SidebarMenuButton onClick={handleLogout} tooltip="Log out"><LogOut /><span>Log out</span></SidebarMenuButton></SidebarMenuItem>
      </SidebarMenu></SidebarFooter>
    </Sidebar>
  )
}
