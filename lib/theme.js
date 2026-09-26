/**
 * Site theme. Light (the paper sheet) is the default for every visitor,
 * whatever their OS setting; dark is an explicit choice made with the nav
 * toggle and remembered in localStorage.
 *
 * The inline boot script in app/layout.jsx applies a stored choice before
 * first paint, so a returning dark-theme visitor never sees a light flash.
 */

export const THEME_KEY = "site-theme"
export const THEMES = ["light", "dark"]

/** Inline, pre-paint: applies a stored theme. Must stay dependency-free. */
export const THEME_BOOT =
  `(function(){try{var t=localStorage.getItem('${THEME_KEY}');` +
  `if(t==='dark'||t==='light')document.documentElement.dataset.theme=t;}catch(e){}})()`

export function getTheme() {
  if (typeof document === "undefined") return "light"
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light"
}

export function setTheme(theme) {
  const next = theme === "dark" ? "dark" : "light"
  document.documentElement.dataset.theme = next
  try {
    localStorage.setItem(THEME_KEY, next)
  } catch {
    // Private mode / blocked storage: the choice just won't persist.
  }
  window.dispatchEvent(new CustomEvent("themechange", { detail: next }))
}

/** Subscribe to theme changes; returns an unsubscribe function. */
export function onThemeChange(callback) {
  const handler = (e) => callback(e.detail)
  window.addEventListener("themechange", handler)
  return () => window.removeEventListener("themechange", handler)
}

/** Current value of a CSS custom property on the root (e.g. "--bg"). */
export function readToken(name) {
  if (typeof document === "undefined") return ""
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
