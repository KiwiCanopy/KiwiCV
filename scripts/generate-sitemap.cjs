const { createClient } = require('@sanity/client');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env and .env.local for standard Node executions (like npm run build)
function loadEnv() {
  const envPaths = [path.join(__dirname, '..', '.env'), path.join(__dirname, '..', '.env.local')];
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const firstEqual = trimmed.indexOf('=');
          if (firstEqual !== -1) {
            const key = trimmed.slice(0, firstEqual).trim();
            let value = trimmed.slice(firstEqual + 1).trim();
            if (
              (value.startsWith('"') && value.endsWith('"')) ||
              (value.startsWith("'") && value.endsWith("'"))
            ) {
              value = value.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = value;
            }
          }
        }
      });
    }
  }
}
loadEnv();

/**
 * KiwiCV Sitemap Generator
 *
 * This script automates the generation of sitemap.xml by:
 * 1. Defining static routes for every supported language.
 * 2. Fetching all blog posts from Sanity CMS across all languages.
 * 3. Adding <lastmod> tags and <xhtml:link> (hreflang) for SEO.
 */

// Configuration
const LANGUAGES = require('./languages.cjs');
const { BASE_URL, DEFAULT_LANG, localizedUrl } = require('./localized-url.cjs');
const OUTPUT_PATH = path.join(__dirname, '../public/sitemap.xml');
const UPDATE_SITEMAP_DATES = process.argv.includes('--update-sitemap-dates');

function getExistingLastmodByLoc(xml) {
  const lastmodByLoc = new Map();
  const urlBlockRegex =
    /<url>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?<lastmod>([^<]+)<\/lastmod>[\s\S]*?<\/url>/g;
  let match;

  while ((match = urlBlockRegex.exec(xml)) !== null) {
    lastmodByLoc.set(match[1], match[2]);
  }

  return lastmodByLoc;
}

function getExistingBlogBlocks(xml) {
  const urlBlocks = xml.match(/  <url>[\s\S]*?  <\/url>/g) || [];

  return urlBlocks
    .filter((block) => /<loc>[^<]+\/blog\/[^<]+<\/loc>/.test(block))
    .map((block) => block.replace(/https:\/\/(?:www\.)?cvcanvas\.app/g, BASE_URL));
}

// Sanity Client (Credentials from environment variables)
const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || 'dummy',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-03-11',
});

// Static routes that exist for every language.
//
// `/dashboard`, `/login`, `/account`, `/settings` and `/json` were removed on
// 2026-07-23:
// they are account chrome and a raw-data editor, with nothing a searcher
// wants, and listing them here actively asked Google to index them — `/login`
// and `/account` at priority 0.6, above `/legal-notice`.
//
// ⚠️ They now emit `noindex, follow` from `NOINDEX_PAGES` in
// `src/components/ui/SEO.tsx`. The two lists have to move together: a sitemap
// entry is a request to index, so listing a `noindex` URL asks for two
// contradictory things and Google reports it as an error.
const STATIC_ROUTES = [
  { path: '', priority: '1.0', changefreq: 'weekly' },
  { path: '/blog', priority: '0.9', changefreq: 'weekly' },
  { path: '/extras', priority: '0.8', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.5', changefreq: 'yearly' },
  { path: '/terms', priority: '0.5', changefreq: 'yearly' },
  { path: '/withdrawal', priority: '0.5', changefreq: 'yearly' },
  { path: '/legal-notice', priority: '0.3', changefreq: 'yearly' },
];

async function generateSitemap() {
  console.log('🚀 Starting Sitemap Generation...');

  const existingXml = fs.existsSync(OUTPUT_PATH) ? fs.readFileSync(OUTPUT_PATH, 'utf8') : '';
  const existingLastmodByLoc = getExistingLastmodByLoc(existingXml);
  const existingBlogBlocks = getExistingBlogBlocks(existingXml);

  if (UPDATE_SITEMAP_DATES) {
    console.log('📅 Updating static sitemap dates because --update-sitemap-dates was provided.');
  }

  if (!process.env.VITE_SANITY_PROJECT_ID) {
    console.warn('⚠️  VITE_SANITY_PROJECT_ID not set. Blog posts will be skipped.');
  }

  const today = new Date().toISOString().split('T')[0];
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

  // --- Static Routes ---
  console.log(
    `📦 Processing ${STATIC_ROUTES.length} static routes across ${LANGUAGES.length} languages...`,
  );
  for (const route of STATIC_ROUTES) {
    // Every route is listed once per language. English resolves to the
    // unprefixed form, so the home page's English <loc> IS the origin root —
    // which is what makes the root an indexable page Google can read a site
    // name from, rather than a URL nothing points at.
    for (const lang of LANGUAGES) {
      // Determine the <loc> URL for the current block
      const currentUrl = localizedUrl(lang, route.path);

      xml += `  <url>\n`;
      xml += `    <loc>${currentUrl}</loc>\n`;

      // x-default points at the English URL, in the same unprefixed form the
      // page's own <link rel="alternate" hreflang="x-default"> emits.
      const defaultHref = localizedUrl(DEFAULT_LANG, route.path);
      xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultHref}" />\n`;

      // Add alternate languages (hreflang) for all supported languages
      for (const altLang of LANGUAGES) {
        xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${localizedUrl(altLang, route.path)}" />\n`;
      }

      const staticLastmod = UPDATE_SITEMAP_DATES
        ? today
        : existingLastmodByLoc.get(currentUrl) || today;
      xml += `    <lastmod>${staticLastmod}</lastmod>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `  </url>\n`;
    }
  }

  const appendExistingBlogBlocks = () => {
    if (existingBlogBlocks.length === 0) return;
    console.warn(`♻️  Preserving ${existingBlogBlocks.length} existing blog sitemap entries.`);
    // Preserved blocks are raw XML from the previous run, so entries written
    // before English moved to the root still carry `/en/`. Without Sanity
    // credentials this fallback is the ONLY thing that writes blog URLs, so
    // leaving them prefixed would keep the sitemap pointing at 301s forever.
    const rerooted = existingBlogBlocks.map((block) =>
      block.replaceAll(`${BASE_URL}/${DEFAULT_LANG}/`, `${BASE_URL}/`),
    );
    xml += `${rerooted.join('\n')}\n`;
  };

  // --- Dynamic Blog Posts ---
  if (process.env.VITE_SANITY_PROJECT_ID) {
    console.log('📰 Fetching blog posts from Sanity...');
    try {
      const posts = await client.fetch(`*[_type == "post" && defined(slug.current)] {
        "slug": slug.current,
        language,
        _updatedAt,
        "translations": *[_type == "translation.metadata" && references(^._id)][0].translations[]{
          language,
          "slug": value->slug.current
        }
      }`);

      console.log(`✅ Found ${posts.length} blog posts.`);

      for (const post of posts) {
        const postLang = post.language || DEFAULT_LANG;
        const fullUrl = localizedUrl(postLang, `/blog/${post.slug}`);
        const postLastmod = post._updatedAt.split('T')[0];

        // ⚠️ Filtered after the dereference, not in GROQ. The document-
        // internationalization plugin writes weak references while the target
        // is a draft; a discarded draft leaves one pointing at nothing, and it
        // still satisfies `defined(value)` — only `value->` returns the null
        // slug that gives it away. Three orphans lived in this dataset for four
        // months precisely because nothing looked past the reference object.
        const translations = (post.translations || []).filter(
          (translation) => translation && translation.language && translation.slug,
        );

        xml += `  <url>\n`;
        xml += `    <loc>${fullUrl}</loc>\n`;

        // ⚠️ This set must stay identical to the one `<SEO />` emits for the
        // same post — both read `translation.metadata`, and a sitemap that
        // advertises alternates the page does not confirm is discarded whole.
        //
        // Unlike STATIC_ROUTES above, the set is NOT every language: a post
        // exists in the languages it was written in and no others, and its
        // slugs differ per language, so there is nothing to derive from
        // LANGUAGES here. A lone entry means no translation is linked yet.
        if (translations.length > 1) {
          const defaultTranslation = translations.find(
            (translation) => translation.language === DEFAULT_LANG,
          );
          if (defaultTranslation) {
            const defaultHref = localizedUrl(DEFAULT_LANG, `/blog/${defaultTranslation.slug}`);
            xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultHref}" />\n`;
          }
          for (const translation of translations) {
            const href = localizedUrl(translation.language, `/blog/${translation.slug}`);
            xml += `    <xhtml:link rel="alternate" hreflang="${translation.language}" href="${href}" />\n`;
          }
        }

        xml += `    <lastmod>${postLastmod}</lastmod>\n`;
        xml += `    <priority>0.8</priority>\n`;
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `  </url>\n`;
      }
    } catch (error) {
      console.error('❌ Error fetching posts from Sanity:', error.message);
      appendExistingBlogBlocks();
    }
  } else {
    appendExistingBlogBlocks();
  }

  xml += `</urlset>`;

  if (xml === existingXml) {
    console.log('✅ Sitemap unchanged. No file written.');
    return;
  }

  fs.writeFileSync(OUTPUT_PATH, xml);
  console.log(`✨ Sitemap successfully generated at: ${OUTPUT_PATH}`);
}

generateSitemap().catch(console.error);
