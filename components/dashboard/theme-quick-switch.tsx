"use client"

import { Moon, Sun, Monitor, Palette, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/providers/theme-provider"
import { THEMES, COLOR_MODES, type ColorMode, type ThemeId } from "@/lib/themes"

const MODE_ICONS: Record<ColorMode, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
}

export function ThemeQuickSwitch() {
  const { theme, colorMode, setTheme, setColorMode } = useTheme()
  const ModeIcon = MODE_ICONS[colorMode]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label="Theme settings" />}>
        <ModeIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Color mode</DropdownMenuLabel>
        <DropdownMenuGroup>
          {COLOR_MODES.map((mode) => {
            const Icon = MODE_ICONS[mode]
            return (
              <DropdownMenuItem key={mode} onClick={() => setColorMode(mode)}>
                <Icon data-icon="inline-start" />
                <span className="capitalize">{mode}</span>
                {colorMode === mode && <Check className="ml-auto size-3.5" />}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex items-center gap-2">
          <Palette className="size-3.5" />
          Theme
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {THEMES.map((t) => (
            <DropdownMenuItem key={t.id} onClick={() => setTheme(t.id as ThemeId)}>
              <span>{t.label}</span>
              {theme === t.id && <Check className="ml-auto size-3.5" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
