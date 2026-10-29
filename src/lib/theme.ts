/** Page background per theme; the browser bar (theme-color) matches it. Same values as --bg in globals.css. */
export const THEME_BG = { dark: "#0a0e13", light: "#f6f7f4" } as const;

/** Points every theme-color meta at the chosen theme, so a toggle overrides the OS-based media queries. */
export function paintThemeColor(theme: keyof typeof THEME_BG) {
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute("content", THEME_BG[theme]));
}
