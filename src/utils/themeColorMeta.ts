/**
 * Points `<meta name="theme-color">` at the current `--card`, the dashboard
 * bar's fill, so the installed app's status bar follows light/dark instead of
 * the manifest's single colour. Call after every theme-class change.
 * Off the dashboard the bar is `--background`, a slight tonal step; accepted,
 * since the installed app opens on the dashboard.
 */
export function syncThemeColorMeta() {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  const card = getComputedStyle(document.documentElement).getPropertyValue('--card').trim();
  if (meta && card) meta.content = `hsl(${card})`;
}
