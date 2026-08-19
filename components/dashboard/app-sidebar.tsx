"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Database,
  LayoutGrid,
  Layers,
  Webhook,
  Activity,
  Settings,
  LogOut,
  ChevronsUpDown,
  Plus,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { Workspace } from "@/lib/types"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/workspaces", label: "Workspaces", icon: Layers },
  { href: "/dashboard/api", label: "API", icon: Webhook },
  { href: "/dashboard/activity", label: "Activity", icon: Activity },
]

export function AppSidebar({
  user,
  workspaces,
}: {
  user: { email: string; username: string; displayName: string | null }
  workspaces: Workspace[]
}) {
  const pathname = usePathname()
  const router = useRouter()

  const currentSlug = pathname.match(/^\/dashboard\/workspaces\/([^/]+)/)?.[1]
  const currentWorkspace = workspaces.find((w) => w.slug === currentSlug)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Database className="size-3.5" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-mono text-sm font-semibold">Datakit</span>
                  <span className="text-xs text-muted-foreground">@{user.username}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-1 py-3">
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<SidebarMenuButton />}>
                    <Layers />
                    <span className="truncate">{currentWorkspace?.name ?? "Select workspace"}</span>
                    <ChevronsUpDown className="ml-auto size-3.5 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {workspaces.map((w) => (
                      <DropdownMenuItem key={w.id} render={<Link href={`/dashboard/workspaces/${w.slug}`} />}>
                        <Layers data-icon="inline-start" />
                        {w.name}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem render={<Link href="/dashboard/workspaces/new" />}>
                      <Plus data-icon="inline-start" />
                      New workspace
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname.startsWith("/dashboard/settings")} tooltip="Settings">
              <Link href="/dashboard/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Log out">
              <LogOut />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
