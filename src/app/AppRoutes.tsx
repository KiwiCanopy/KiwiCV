import { type ReactNode, Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

import {
  LanguageSyncWrapper,
  LegacyEnglishRedirect,
  RootLanguageGate,
} from '@/app/LanguageRouting';
import { useTranslation } from '@/hooks/useTranslation';
import { MainLayout } from '@/layouts/MainLayout';
import { PromoRedirect } from '@/pages/PromoRedirect';
import { PREFIXED_LANGUAGES } from '@/utils/localeRouting';
import { LoaderCircle } from 'lucide-react';

const LandingPage = lazy(() =>
  import('@/pages/LandingPage').then((module) => ({ default: module.LandingPage })),
);
const Login = lazy(() => import('@/pages/Login').then((module) => ({ default: module.Login })));
const Dashboard = lazy(() =>
  import('@/pages/Dashboard').then((module) => ({ default: module.Dashboard })),
);
const CvLibraryPage = lazy(() =>
  import('@/pages/CvLibraryPage').then((module) => ({ default: module.CvLibraryPage })),
);
const Account = lazy(() =>
  import('@/pages/AccountPage').then((module) => ({ default: module.default || module.Account })),
);
const Settings = lazy(() =>
  import('@/pages/Settings').then((module) => ({ default: module.Settings })),
);
const Extras = lazy(() => import('@/pages/Extras').then((module) => ({ default: module.Extras })));
const RawJsonData = lazy(() =>
  import('@/pages/RawJsonData').then((module) => ({ default: module.RawJsonData })),
);
const Legal = lazy(() => import('@/pages/Legal').then((module) => ({ default: module.Legal })));
const LegalNotice = lazy(() =>
  import('@/pages/LegalNotice').then((module) => ({ default: module.LegalNotice })),
);
const BlogOverview = lazy(() =>
  import('@/pages/Blog/BlogOverview').then((module) => ({ default: module.BlogOverview })),
);
const BlogPost = lazy(() =>
  import('@/pages/Blog/BlogPost').then((module) => ({ default: module.BlogPost })),
);
const NotFound = lazy(() =>
  import('@/pages/NotFound').then((module) => ({ default: module.NotFound })),
);

function RouteLoader() {
  const { t } = useTranslation();

  return (
    <div className="bg-background flex h-screen w-full items-center justify-center p-8">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <LoaderCircle className="text-primary-strong h-12 w-12 animate-spin opacity-20" />
          <div className="bg-primary absolute inset-0 animate-pulse rounded-full opacity-5 blur-xl" />
        </div>
        <p className="text-muted-foreground animate-pulse text-xs font-black tracking-[0.2em] uppercase opacity-40">
          {t('common.loading_indicator')}
        </p>
      </div>
    </div>
  );
}

function LazyRoute({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteLoader />}>{children}</Suspense>;
}

/**
 * The page tree, mounted once per locale.
 *
 * English hangs off `/` and every other locale off `/xx`, so the same children
 * are rendered under sixteen different parents. Returned as a Fragment, which
 * `createRoutesFromChildren` flattens transparently — keep it that way rather
 * than returning an array, so no call site has to invent keys.
 *
 * Paths here are relative and carry no locale segment. That is the invariant:
 * nothing below this function knows whether it is mounted at the root or under
 * a prefix.
 */
function localeRoutes() {
  return (
    <>
      <Route
        path="login"
        element={
          <LazyRoute>
            <Login />
          </LazyRoute>
        }
      />
      <Route element={<MainLayout />}>
        <Route
          index
          element={
            <LazyRoute>
              <LandingPage />
            </LazyRoute>
          }
        />
        <Route
          path="blog"
          element={
            <LazyRoute>
              <BlogOverview />
            </LazyRoute>
          }
        />
        <Route
          path="blog/:slug"
          element={
            <LazyRoute>
              <BlogPost />
            </LazyRoute>
          }
        />
        <Route
          path="dashboard"
          element={
            <LazyRoute>
              <Dashboard />
            </LazyRoute>
          }
        />
        <Route
          path="cvs"
          element={
            <LazyRoute>
              <CvLibraryPage />
            </LazyRoute>
          }
        />
        <Route
          path="account"
          element={
            <LazyRoute>
              <Account />
            </LazyRoute>
          }
        />
        <Route
          path="json"
          element={
            <LazyRoute>
              <RawJsonData />
            </LazyRoute>
          }
        />
        <Route
          path="settings"
          element={
            <LazyRoute>
              <Settings />
            </LazyRoute>
          }
        />
        <Route
          path="privacy"
          element={
            <LazyRoute>
              <Legal />
            </LazyRoute>
          }
        />
        <Route
          path="legal-notice"
          element={
            <LazyRoute>
              <LegalNotice />
            </LazyRoute>
          }
        />
        <Route
          path="terms"
          element={
            <LazyRoute>
              <Legal />
            </LazyRoute>
          }
        />
        <Route
          path="withdrawal"
          element={
            <LazyRoute>
              <Legal />
            </LazyRoute>
          }
        />
        <Route
          path="extras"
          element={
            <LazyRoute>
              <Extras />
            </LazyRoute>
          }
        />
        {/* An unknown path is a 404, not a silent bounce to the landing page.
            Under `/` this is the site-wide 404: a first segment that is not a
            locale never matches a prefixed subtree, so it lands here. */}
        <Route
          path="*"
          element={
            <LazyRoute>
              <NotFound />
            </LazyRoute>
          }
        />
      </Route>
    </>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Non-default locales keep their prefix. Mounted as static paths rather
          than one `/:lang` param so that `/nonsense` is not mistaken for an
          unknown locale — it is simply not a locale route. */}
      {PREFIXED_LANGUAGES.map((code) => (
        <Route key={code} path={`/${code}`} element={<LanguageSyncWrapper lang={code} />}>
          {localeRoutes()}
        </Route>
      ))}

      {/* The retired English prefix. `netlify.toml` 301s these for real
          requests; these routes catch in-app navigation and the dev server. */}
      <Route path="/en" element={<LegacyEnglishRedirect />} />
      <Route path="/en/*" element={<LegacyEnglishRedirect />} />

      <Route path="/promo/:channel" element={<PromoRedirect />} />

      {/* English, unprefixed, at the origin root. */}
      <Route path="/" element={<RootLanguageGate />}>
        {localeRoutes()}
      </Route>
    </Routes>
  );
}
