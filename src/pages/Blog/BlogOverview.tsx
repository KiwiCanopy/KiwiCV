import { useEffect, useState } from 'react';
import { GrArticle } from 'react-icons/gr';
import { Link } from 'react-router-dom';

import { useLanguage } from '@/hooks/useLanguage';
import { useTranslation } from '@/hooks/useTranslation';
import { type SanityPost, getPosts, urlFor } from '@/lib/sanity';
import { CategoryBadge } from '@/pages/Blog/components/CategoryBadge';
import { sortCategories } from '@/pages/Blog/utils/category';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { localizedPath } from '@/utils/localeRouting';
import { Calendar, ChevronRight, Clock } from 'lucide-react';

export function BlogOverview() {
  const lang = useLanguage();
  const { t } = useTranslation();
  const [posts, setPosts] = useState<SanityPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await getPosts(lang || 'en');
        setPosts(data);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, [lang]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-20">
        <div className="border-primary-strong h-12 w-12 animate-spin rounded-full border-4 border-t-transparent" />
      </div>
    );
  }

  // No SEO override: /{lang}/blog resolves to the localized seo.blog.* pair,
  // which is the copy written for search results.
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-16 text-center">
        <div className="bg-primary/10 text-primary-strong mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold tracking-wider uppercase">
          <GrArticle className="h-4 w-4" />
          {t('blog.tagline')}
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl">{t('blog.title')}</h1>
        <p className="text-muted-foreground mx-auto mt-6 max-w-2xl text-lg">{t('blog.subtitle')}</p>
      </div>

      {posts.length === 0 ? (
        <div className="bg-card/50 flex flex-col items-center justify-center rounded-3xl border border-dashed p-20 text-center backdrop-blur-xl">
          <GrArticle className="text-muted-foreground mb-4 h-12 w-12 opacity-20" />
          <p className="text-muted-foreground text-lg">{t('blog.no_posts')}</p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.slug}
              to={localizedPath(lang, `/blog/${post.slug}`)}
              onClick={() =>
                analytics.track(ANALYTICS_EVENTS.BLOG_POST_CLICKED, {
                  slug: post.slug,
                  lang: lang || 'en',
                  categories: post.categories?.map((c) => c.title) || [],
                })
              }
              className="group bg-card/40 border-border/50 hover:border-primary-strong/30 hover:shadow-primary-strong/5 relative flex flex-col overflow-hidden rounded-[2rem] border transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"
            >
              {/* Image Container */}
              <div className="bg-muted relative aspect-[16/10] overflow-hidden">
                {post.mainImage ? (
                  <>
                    {/* Blurred Background */}
                    <img
                      src={urlFor(post.mainImage).width(400).url()}
                      aria-hidden="true"
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover blur-2xl brightness-90 saturate-150"
                    />
                    {/* Foreground Image */}
                    <img
                      src={urlFor(post.mainImage).width(800).url()}
                      alt={post.title}
                      className="relative z-10 h-full w-full object-contain transition-transform duration-700 group-hover:scale-110"
                    />
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <GrArticle className="text-muted-foreground h-12 w-12 opacity-20" />
                  </div>
                )}
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                {/* Language Badge if fallback */}
                {post.language !== lang && (
                  <div className="absolute top-4 right-4 rounded-md border border-white/10 bg-black/50 px-2 py-1 text-[10px] font-bold tracking-widest text-white uppercase backdrop-blur-md">
                    {post.language}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-8">
                {/* Categories */}
                {post.categories && post.categories.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {sortCategories(post.categories).map((cat) => (
                      <CategoryBadge key={cat.title} title={cat.title} color={cat.color} />
                    ))}
                  </div>
                )}

                <div className="text-muted-foreground mb-4 flex items-center gap-2 text-xs font-medium">
                  <Calendar className="h-3.5 w-3.5" />
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString(lang, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : t('blog.unknown_date')}
                  <span className="mx-1 opacity-20">•</span>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    {t('blog.reading_time', { minutes: post.readingTime || 5 })}
                  </div>
                </div>

                <h3 className="group-hover:text-primary-strong mb-3 text-xl leading-tight font-extrabold transition-colors">
                  {post.title}
                </h3>
                <p className="text-muted-foreground mb-6 line-clamp-10 text-sm leading-relaxed">
                  {post.teaser}
                </p>

                <div className="text-primary-strong mt-auto flex -translate-x-2 items-center gap-1 text-sm font-bold opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100">
                  {t('blog.read_more')}
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
