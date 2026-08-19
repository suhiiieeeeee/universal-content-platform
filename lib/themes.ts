export const THEMES = [
  { id: "mono", label: "Mono", description: "Strict grayscale, high contrast" },
  { id: "slate", label: "Slate", description: "Cool gray-blue neutrals" },
  { id: "midnight", label: "Midnight", description: "Deep navy with indigo accent" },
  { id: "paper", label: "Paper", description: "Warm off-white, ink accent" },
  { id: "terminal", label: "Terminal", description: "Near-black with phosphor green" },
  { id: "ocean", label: "Ocean", description: "Teal and cyan" },
  { id: "forest", label: "Forest", description: "Earthy green" },
] as const

export type ThemeId = (typeof THEMES)[number]["id"]

export const COLOR_MODES = ["light", "dark", "system"] as const
export type ColorMode = (typeof COLOR_MODES)[number]

export const FONT_SIZES = ["small", "medium", "large"] as const
export type FontSize = (typeof FONT_SIZES)[number]

export const EDITOR_MODES = ["visual", "json", "markdown"] as const
export type EditorMode = (typeof EDITOR_MODES)[number]

export const DEFAULT_THEME: ThemeId = "mono"
export const DEFAULT_COLOR_MODE: ColorMode = "dark"

export interface UserPreferences {
  theme: ThemeId
  color_mode: ColorMode
  editor_mode: EditorMode
  sidebar_collapsed: boolean
  font_size: FontSize
  reduced_motion: boolean
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: DEFAULT_THEME,
  color_mode: DEFAULT_COLOR_MODE,
  editor_mode: "visual",
  sidebar_collapsed: false,
  font_size: "medium",
  reduced_motion: false,
}
