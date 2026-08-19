"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  DEFAULT_COLOR_MODE,
  DEFAULT_THEME,
  type ColorMode,
  type FontSize,
  type ThemeId,
} from "@/lib/themes"

const STORAGE_KEY = "dk-preferences"

interface StoredPrefs {
  theme: ThemeId
  colorMode: ColorMode
  fontSize: FontSize
  reducedMotion: boolean
}

interface ThemeContextValue extends StoredPrefs {
  setTheme: (theme: ThemeId) => void
  setColorMode: (mode: ColorMode) => void
  setFontSize: (size: FontSize) => void
  setReducedMotion: (value: boolean) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function readStored(): StoredPrefs {
  if (typeof window === "undefined") {
    return { theme: DEFAULT_THEME, colorMode: DEFAULT_COLOR_MODE, fontSize: "medium", reducedMotion: false }
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return { theme: DEFAULT_THEME, colorMode: DEFAULT_COLOR_MODE, fontSize: "medium", reducedMotion: false }
}

function applyToDocument(prefs: StoredPrefs) {
  const root = document.documentElement
  root.setAttribute("data-theme", prefs.theme)

  const resolvedDark =
    prefs.colorMode === "dark" ||
    (prefs.colorMode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  root.classList.toggle("dark", resolvedDark)
  root.classList.toggle("light", !resolvedDark)
  root.setAttribute("data-font-size", prefs.fontSize)
  root.classList.toggle("reduce-motion", prefs.reducedMotion)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<StoredPrefs>(() => readStored())

  useEffect(() => {
    applyToDocument(prefs)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    } catch {
      // ignore
    }
  }, [prefs])

  // React to system color scheme changes when in "system" mode
  useEffect(() => {
    if (prefs.colorMode !== "system") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const listener = () => applyToDocument(prefs)
    mq.addEventListener("change", listener)
    return () => mq.removeEventListener("change", listener)
  }, [prefs])

  // Pull the authenticated user's saved preferences from Supabase on mount, and reconcile.
  useEffect(() => {
    let active = true
    async function sync() {
      const supabase = createClient()
      const { data: authData } = await supabase.auth.getUser()
      if (!authData.user) return

      const { data } = await supabase
        .from("user_preferences")
        .select("theme, color_mode, font_size, reduced_motion")
        .eq("user_id", authData.user.id)
        .maybeSingle()

      if (!active || !data) return

      setPrefs({
        theme: data.theme as ThemeId,
        colorMode: data.color_mode as ColorMode,
        fontSize: data.font_size as FontSize,
        reducedMotion: data.reduced_motion,
      })
    }
    sync()
    return () => {
      active = false
    }
  }, [])

  const persistRemote = useCallback((partial: Partial<StoredPrefs>) => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      const payload: Record<string, unknown> = {}
      if (partial.theme !== undefined) payload.theme = partial.theme
      if (partial.colorMode !== undefined) payload.color_mode = partial.colorMode
      if (partial.fontSize !== undefined) payload.font_size = partial.fontSize
      if (partial.reducedMotion !== undefined) payload.reduced_motion = partial.reducedMotion
      supabase
        .from("user_preferences")
        .update(payload)
        .eq("user_id", data.user.id)
        .then(() => {})
    })
  }, [])

  const setTheme = useCallback(
    (theme: ThemeId) => {
      setPrefs((p) => ({ ...p, theme }))
      persistRemote({ theme })
    },
    [persistRemote],
  )
  const setColorMode = useCallback(
    (colorMode: ColorMode) => {
      setPrefs((p) => ({ ...p, colorMode }))
      persistRemote({ colorMode })
    },
    [persistRemote],
  )
  const setFontSize = useCallback(
    (fontSize: FontSize) => {
      setPrefs((p) => ({ ...p, fontSize }))
      persistRemote({ fontSize })
    },
    [persistRemote],
  )
  const setReducedMotion = useCallback(
    (reducedMotion: boolean) => {
      setPrefs((p) => ({ ...p, reducedMotion }))
      persistRemote({ reducedMotion })
    },
    [persistRemote],
  )

  const value = useMemo<ThemeContextValue>(
    () => ({ ...prefs, setTheme, setColorMode, setFontSize, setReducedMotion }),
    [prefs, setTheme, setColorMode, setFontSize, setReducedMotion],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}
