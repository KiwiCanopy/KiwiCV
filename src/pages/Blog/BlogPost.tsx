import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link, useParams } from 'react-router-dom';

import { JsonLd } from '@/components/ui/JsonLd';
import { BRAND_CONFIG } from '@/config/brand';
import { useLanguage } from '@/hooks/useLanguage';
import { useSeoOverride } from '@/hooks/useSeoOverride';
import { useTranslation } from '@/hooks/useTranslation';
import { type SanityPost, getPostBySlug, urlFor } from '@/lib/sanity';
import { CategoryBadge } from '@/pages/Blog/components/CategoryBadge';
import { OptimizedMedia } from '@/pages/Blog/components/OptimizedMedia';
import { sortCategories } from '@/pages/Blog/utils/category';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { useToastStore } from '@/store/ui/useToastStore';
import { localizedPath, localizedUrl } from '@/utils/localeRouting';
import { toPlainText } from '@/utils/structured-data';
import { Calendar, ChevronLeft, Clock, Share2 } from 'lucide-react';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const lang = useLanguage();
  const { t } = useTranslation();
  const addToast = useToastStore((state) => state.addToast);
  const [post, setPost] = useState<SanityPost | null>(null);
  const [loading, setLoading] = useState(true);

  const postPath = slug ? `/blog/${slug}` : '/blog';

  // This route serves the same article under more than one prefix. `getPosts`
  // falls back to English for locales with no posts of their own and the
  // overview links what it lists, so `/fr/blog/kiwicv-origin` renders the
  // English post. Only the view whose locale matches the post is canonical;
  // the other 13 pin their canonical to it rather than each claiming to be an
  // independent copy of the same text.
  const isCanonicalView = post?.language === lang;

  // hreflang rides on the canonical view alone — a set published from a page
  // that canonicalizes elsewhere is ignored — and the set names only languages
  // that exist, never the 15-locale registry. `translations` includes the post
  // itself, which is what makes the pair reciprocal: each variant points at
  // itself and at its counterpart, and Google discards a set that does not.
  // Fewer than two entries means nothing is linked in Sanity yet, and the
  // route falls back to publishing no alternates at all.
  const translations = post?.translations ?? [];
  const alternates =
    isCanonicalView && translations.length > 1
      ? translations.map((translation) => ({
          lang: translation.language,
          pathWithoutLang: `/blog/${translation.slug}`,
        }))
      : false;

  // While the fetch is in flight the canonical is the served URL's own; going
  // `noindex` there would risk a prerender snapshot de-indexing a live article.
  useSeoOverride(
    loading
      ? { pathWithoutLang: postPath, alternates: false }
      : post
        ? {
            title: `${post.seoTitle || post.title} | KiwiCV Blog`,
            description: post.seoDescription || post.teaser || post.title,
            pathWithoutLang: postPath,
            image: post.mainImage ? urlFor(post.mainImage).width(1200).url() : undefined,
            canonicalLang: post.language,
            alternates,
          }
        : {
            title: t('blog.post_not_found'),
            pathWithoutLang: postPath,
            noindex: true,
            alternates: false,
          },
  );

  useEffect(() => {
    async function loadPost() {
      if (!slug) return;
      try {
        const data = await getPostBySlug(slug);
        setPost(data);

        // Track view
        if (data) {
          analytics.track(ANALYTICS_EVENTS.BLOG_POST_VIEWED, {
            slug: data.slug,
            lang: lang || 'en',
            categories: data.categories?.map((c) => c.title) || [],
          });
        }
      } catch (error) {
        console.error('Failed to fetch post:', error);
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [slug, lang]);

  const handleShare = async () => {
    if (!post) return;

    analytics.track(ANALYTICS_EVENTS.BLOG_SHARE_CLICKED, {
      slug: post.slug,
      platform: 'native_share',
      categories: post.categories?.map((c) => c.title) || [],
    });

    // Check if Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.teaser,
          url: window.location.href,
        });
      } catch (err) {
        // Only show error if it's not a user cancellation
        if (err instanceof Error && err.name !== 'AbortError') {
          console.warn('Full share failed, retrying with URL only:', err);
          try {
            await navigator.share({
              url: window.location.href,
            });
          } catch (retryErr) {
            if (retryErr instanceof Error && retryErr.name !== 'AbortError') {
              console.error('Share failed after retry:', retryErr);
              addToast(t('blog.share_error'), 'error');
            }
          }
        }
      }
    } else if (navigator.clipboard) {
      // Fallback 1: Copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        addToast(t('common.copied'), 'success');
      } catch (err) {
        console.error('Clipboard failed:', err);
        addToast(t('blog.share_error'), 'error');
      }
    } else {
      // Fallback 2: Manual copy hint
      console.warn('Sharing and Clipboard API unavailable');
      if (!window.isSecureContext) {
        addToast(t('blog.share_insecure'), 'warning');
      } else {
        addToast(t('blog.share_error'), 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-20">
        <div className="border-primary-strong h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-center">
        <h1 className="text-2xl font-extrabold">{t('blog.post_not_found')}</h1>
        <Link
          to={localizedPath(lang, `/blog`)}
          className="text-primary-strong mt-4 flex items-center gap-2 font-bold"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('blog.back_to_overview')}
        </Link>
      </div>
    );
  }

  // Article + BreadcrumbList. Every value here is already fetched and already
  // rendered somewhere on the page, so the structured data cannot drift from
  // what a reader sees. The breadcrumb mirrors the visual back-navigation
  // below rather than inventing a hierarchy.
  // ⚠️ Built from `post.language`, not the served locale, and through
  // `localizedUrl` rather than a `/${lang}` template.
  //
  // The template was wrong twice over. For English it produced
  // `/en/blog/<slug>` — a URL `netlify.toml` 301s and the sitemap never lists —
  // so the Article's `@id` named a redirect while the canonical named the bare
  // path. And on a fallback view like `/fr/blog/kiwicv-origin` it claimed a
  // French identity for the English article the canonical now points away from,
  // which is the same "independent copy" assertion this route exists to retract,
  // relocated from one tag to another. Every identity claim on the page has to
  // name the one URL the canonical names.
  const postUrl = localizedUrl(BRAND_CONFIG.canonicalOrigin, post.language, postPath);
  const heroUrl = post.mainImage ? urlFor(post.mainImage).width(1200).url() : undefined;
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: toPlainText(post.title),
    description: toPlainText(post.seoDescription || post.teaser || post.title),
    ...(heroUrl ? { image: heroUrl } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    inLanguage: post.language,
    mainEntityOfPage: { '@type': 'WebPage', '@id': postUrl },
    publisher: {
      '@type': 'Organization',
      name: BRAND_CONFIG.productName,
      logo: {
        '@type': 'ImageObject',
        url: `${BRAND_CONFIG.canonicalOrigin}${BRAND_CONFIG.assets.socialImage}`,
      },
    },
    ...(post.categories?.length
      ? { articleSection: post.categories.map((c) => c.title).filter(Boolean) }
      : {}),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: t('common.pages.blog'),
        item: localizedUrl(BRAND_CONFIG.canonicalOrigin, post.language, '/blog'),
      },
      { '@type': 'ListItem', position: 2, name: toPlainText(post.title), item: postUrl },
    ],
  };

  return (
    <article className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* Breadcrumb / Back Navigation */}
      <nav className="mb-12">
        <Link
          to={localizedPath(lang, `/blog`)}
          className="text-muted-foreground hover:text-primary-strong group flex items-center gap-2 text-sm font-bold transition-colors"
        >
          <div className="bg-muted group-hover:bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </div>
          {t('blog.back_to_overview')}
        </Link>
      </nav>

      {/* Header */}
      <header className="mb-12">
        {/* Categories */}
        {post.categories && post.categories.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {sortCategories(post.categories).map((cat) => (
              <CategoryBadge key={cat.title} title={cat.title} color={cat.color} />
            ))}
          </div>
        )}

        <div className="text-muted-foreground mb-6 flex flex-wrap items-center gap-6 text-sm font-medium">
          <div className="flex items-center gap-2">
            <Calendar className="text-primary-strong h-4 w-4" />
            {post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString(lang, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              : t('blog.unknown_date')}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="text-primary-strong h-4 w-4" />
            {t('blog.reading_time', { minutes: post.readingTime || 5 })}
          </div>
          {post.language !== lang && (
            <div className="bg-primary/10 text-primary-strong rounded-md px-2 py-0.5 text-[10px] font-bold uppercase">
              {post.language} version
            </div>
          )}
        </div>

        <h1 className="text-4xl leading-[1.1] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          {post.title}
        </h1>
      </header>

      {/* Hero Image */}
      {heroUrl && (
        <OptimizedMedia
          key={heroUrl}
          src={heroUrl}
          alt={post.title}
          caption={post.mainImage.caption}
          variant="hero"
        />
      )}

      {/* Content */}
      <div className="prose prose-lg dark:prose-invert prose-primary mx-auto max-w-none">
        <div className="text-foreground/80 space-y-6 leading-relaxed">
          {post.content ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
              components={{
                a: ({ node: _node, ...props }) => {
                  const rel = !props.href?.startsWith('/') ? 'noreferrer noopener' : undefined;
                  const target = !props.href?.startsWith('/') ? '_blank' : undefined;
                  return (
                    <a
                      {...props}
                      rel={rel}
                      target={target}
                      className="text-primary-strong decoration-primary-strong/30 hover:decoration-primary-strong font-medium underline underline-offset-4 transition-colors"
                    />
                  );
                },
                img: ({ node: _node, ...props }) => {
                  return (
                    <OptimizedMedia
                      key={props.src}
                      src={props.src || ''}
                      alt={props.alt}
                      caption={props.title} // Use markdown title as caption
                    />
                  );
                },
              }}
            >
              {post.content}
            </ReactMarkdown>
          ) : (
            <p>{t('blog.no_content')}</p>
          )}
        </div>
      </div>

      {/* Footer / Share */}
      <footer className="border-border/50 mt-20 border-t pt-10">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-4">
            <div className="bg-primary/5 flex h-12 w-12 items-center justify-center rounded-2xl p-2.5">
              <img
                src={BRAND_CONFIG.assets.symbol}
                alt={t('common.logo_alt')}
                className="h-full w-full"
              />
            </div>
            <div>
              <p className="text-sm font-bold">{t('blog.editorial_name')}</p>
              <p className="text-muted-foreground text-xs">{t('blog.editorial_subtitle')}</p>
            </div>
          </div>

          <button
            onClick={handleShare}
            className="border-input bg-card hover:bg-muted focus-visible:ring-primary-strong flex items-center gap-2 rounded-xl border px-6 py-2.5 text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            <Share2 className="h-4 w-4" />
            {t('blog.share_article')}
          </button>
        </div>
      </footer>
    </article>
  );
}
