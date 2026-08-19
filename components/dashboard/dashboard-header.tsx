"use client"

import type React from "react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { ThemeQuickSwitch } from "@/components/dashboard/theme-quick-switch"
import { UserMenu } from "@/components/dashboard/user-menu"

export function DashboardHeader({
  title,
  description,
  actions,
  profile,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  profile: { displayName: string | null; username: string; avatarUrl: string | null }
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-border px-6 py-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-5" />
        <div className="flex flex-col">
          <h1 className="font-mono text-lg font-semibold tracking-tight text-foreground">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <ThemeQuickSwitch />
        <UserMenu displayName={profile.displayName} username={profile.username} avatarUrl={profile.avatarUrl} />
      </div>
    </header>
  )
}
