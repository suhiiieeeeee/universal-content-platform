"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { updatePreferences, updateProfile } from "@/lib/actions/profile"
import { THEMES, COLOR_MODES, FONT_SIZES, EDITOR_MODES, type ThemeId, type ColorMode, type FontSize, type EditorMode } from "@/lib/themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface SettingsPanelProps {
  email: string
  profile: { username: string | null; display_name: string | null; bio: string | null } | null
  preferences: { theme: string; color_mode: string; editor_mode: string; sidebar_collapsed: boolean; font_size: string; reduced_motion: boolean } | null
}

export function SettingsPanel({ email, profile, preferences }: SettingsPanelProps) {
  const [isPending, startTransition] = useTransition()
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "")
  const [username, setUsername] = useState(profile?.username ?? "")
  const [bio, setBio] = useState(profile?.bio ?? "")
  const [theme, setTheme] = useState<ThemeId>((preferences?.theme as ThemeId) || "mono")
  const [colorMode, setColorMode] = useState<ColorMode>((preferences?.color_mode as ColorMode) || "dark")
  const [editorMode, setEditorMode] = useState<EditorMode>((preferences?.editor_mode as EditorMode) || "visual")
  const [fontSize, setFontSize] = useState<FontSize>((preferences?.font_size as FontSize) || "medium")
  const [reducedMotion, setReducedMotion] = useState(preferences?.reduced_motion ?? false)

  function saveProfile() {
    const form = new FormData()
    form.set("display_name", displayName)
    form.set("username", username)
    form.set("bio", bio)
    startTransition(async () => {
      const result = await updateProfile(form)
      result.ok ? toast.success("Profile saved") : toast.error(result.error)
    })
  }

  function savePreferences() {
    startTransition(async () => {
      const result = await updatePreferences({ theme, color_mode: colorMode, editor_mode: editorMode, font_size: fontSize, reduced_motion: reducedMotion })
      result.ok ? toast.success("Preferences saved") : toast.error(result.error)
    })
  }

  return (
    <div className="grid max-w-5xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <Card>
        <CardHeader><CardTitle>Profile</CardTitle><CardDescription>Your public identity in Datakit.</CardDescription></CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2"><Label htmlFor="email">Email</Label><Input id="email" value={email} disabled /></div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="flex flex-col gap-2"><Label htmlFor="display-name">Display name</Label><Input id="display-name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></div>
            <div className="flex flex-col gap-2"><Label htmlFor="username">Username</Label><Input id="username" value={username} onChange={(event) => setUsername(event.target.value)} /></div>
          </div>
          <div className="flex flex-col gap-2"><Label htmlFor="bio">Bio</Label><textarea id="bio" value={bio} onChange={(event) => setBio(event.target.value)} className="min-h-24 rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50" /></div>
          <Button onClick={saveProfile} disabled={isPending}>Save profile</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Appearance</CardTitle><CardDescription>These settings sync with your account.</CardDescription></CardHeader>
        <CardContent className="flex flex-col gap-5">
          <SettingSelect label="Theme" value={theme} onChange={(value) => setTheme(value as ThemeId)} options={THEMES.map((item) => ({ value: item.id, label: item.label }))} />
          <SettingSelect label="Color mode" value={colorMode} onChange={(value) => setColorMode(value as ColorMode)} options={COLOR_MODES.map((value) => ({ value, label: value }))} />
          <SettingSelect label="Editor mode" value={editorMode} onChange={(value) => setEditorMode(value as EditorMode)} options={EDITOR_MODES.map((value) => ({ value, label: value }))} />
          <SettingSelect label="Font size" value={fontSize} onChange={(value) => setFontSize(value as FontSize)} options={FONT_SIZES.map((value) => ({ value, label: value }))} />
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3"><div className="flex flex-col gap-1"><Label htmlFor="reduced-motion">Reduced motion</Label><span className="text-xs text-muted-foreground">Use fewer transition effects.</span></div><Switch id="reduced-motion" checked={reducedMotion} onCheckedChange={setReducedMotion} /></div>
          <Button onClick={savePreferences} disabled={isPending}>Save preferences</Button>
        </CardContent>
      </Card>
    </div>
  )
}

function SettingSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[] }) {
  return <div className="flex flex-col gap-2"><Label>{label}</Label><select value={value} onChange={(event) => onChange(event.target.value)} className="h-9 rounded-lg border border-input bg-background px-3 text-sm capitalize outline-none focus-visible:ring-3 focus-visible:ring-ring/50">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
}
