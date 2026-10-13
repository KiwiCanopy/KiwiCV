// 301s `/en` and `/en/*` for EVERY user agent — the [[redirects]] rules never
// reached bots because the prerender extension answers first (wiki SEO.md).
// Import-free on purpose so deno.lock stays out of the repo (ops/DEPLOYMENT.md).

const isEn = (pathname) => pathname === '/en' || pathname.startsWith('/en/');

/**
 * @param {Request} request
 * @returns {Response | undefined}
 */
export default function enRedirect(request) {
  let url = new URL(request.url);
  if (!isEn(url.pathname)) {
    // The prerenderer runs even before toml-declared functions (measured on
    // deploy-preview-688): a bot request arrives here already rewritten to
    // `/netlify-prerender-function?url=<original>`. Redirect off the original.
    const original = url.searchParams.get('url');
    if (!original) return undefined;
    url = new URL(original);
    if (!isEn(url.pathname)) return undefined;
  }
  const splat = url.pathname.slice('/en'.length) || '/';
  const target = new URL(splat, url.origin);
  target.search = url.search;
  return Response.redirect(target, 301);
}
