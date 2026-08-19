// Runs before hydration to avoid a flash of the wrong theme.
export const THEME_INIT_SCRIPT = `
(function () {
  try {
    var raw = window.localStorage.getItem("dk-preferences");
    var prefs = raw ? JSON.parse(raw) : { theme: "mono", colorMode: "dark", fontSize: "medium", reducedMotion: false };
    var root = document.documentElement;
    root.setAttribute("data-theme", prefs.theme || "mono");
    var isDark = prefs.colorMode === "dark" || (prefs.colorMode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    root.classList.toggle("dark", isDark);
    root.classList.toggle("light", !isDark);
    root.setAttribute("data-font-size", prefs.fontSize || "medium");
    if (prefs.reducedMotion) root.classList.add("reduce-motion");
  } catch (e) {}
})();
`
