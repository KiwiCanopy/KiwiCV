<div align="center">

<img src="public/logos/kiwicv/KiwiCV.svg" alt="KiwiCV" width="200">

### Privacy-first, open-source resume builder

Build your resume once, toggle entries on or off per application,
and export a vector PDF or a static HTML page from one source of
truth.

<br>

[![CI](https://github.com/KiwiCanopy/KiwiCV/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/KiwiCanopy/KiwiCV/actions/workflows/ci.yml)
![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind v4](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white)
![License AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-8DB354)

<br>

[![Try KiwiCV](https://img.shields.io/badge/🥝_Try_KiwiCV-8DB354?style=for-the-badge)](https://kiwicv.kiwicanopy.com)
[![Changelog](https://img.shields.io/badge/📖_Changelog-627D3A?style=for-the-badge)](https://kiwicv.kiwicanopy.com/extras?tab=changelog)
[![Support on Ko-fi](https://img.shields.io/badge/Support-FF5E5B?style=for-the-badge&logo=kofi&logoColor=white)](https://ko-fi.com/kiwicanopy)

</div>

> **Privacy-first.** Your resume data stays in your browser by
> default — nothing to sign up for to start. An account is only
> needed for the AI features and Google Drive backup. The
> application code is all in this repository; hosting and the
> services it uses are described in the
> [privacy policy](https://kiwicv.kiwicanopy.com/privacy).

KiwiCV is a client-side resume builder by KiwiCanopy. One structured
document drives every output: show or hide individual entries to
tailor each application, switch between professionally designed
themes, and export a print-ready PDF (compiled with Typst) or a
self-hostable HTML page — all without your data leaving the browser.

## ✨ Key Features

**Free, always**

- **Modular editing** — Show/hide individual entries without deleting
  them. Tailor one resume per job application from a single source.
- **Templates** — One- and two-column designs; switch without
  retyping anything.
- **PDF & HTML export** — A vector PDF compiled in the browser with
  Typst, or a static HTML page ready for hosting.
- **Your data, portable** — Open JSON export and import built on the
  [JSON Resume](https://jsonresume.org/schema/) schema, a version for
  each role, and optional backup to GitHub or Google Drive.
- **15 languages** — English, German, French, Spanish, Italian,
  Portuguese, Dutch, Polish, Russian, Chinese, Japanese, Bulgarian,
  Turkish, Swedish, and Ukrainian.

**With a Pass (optional, no subscription)**

- **Tailor to a job ad** — Rework a copy of your CV for a specific
  posting, matching its keywords without inventing skills you
  don't have.
- **A matching cover letter** — Drafted from your CV and the ad.
- **Improve with AI** — A single entry, a section, or the whole CV.
- **Translate a whole CV** into another language.
- **Import a PDF or Word CV** into structured, editable data.

AI runs on Google Vertex AI (Gemini) in the EU, server-side; your
data is not used to train models.

## 🛠 Tech Stack

| Layer      | Technology                                    |
| ---------- | --------------------------------------------- |
| Framework  | React 19 + TypeScript                         |
| Build      | Vite                                          |
| Styling    | Tailwind CSS v4                               |
| State      | Zustand                                       |
| Routing    | React Router v7                               |
| PDF engine | Typst (WASM, in-browser)                      |
| Backend    | Netlify Functions, Supabase (auth + Postgres) |
| AI         | Vertex AI (Gemini)                            |
| Payments   | Stripe                                        |
| i18n       | 15-locale modular trees                       |

## 🚀 Getting Started

The repository pins its Node version in `.nvmrc`. `npm ci` and `npm install` refuse
to run on anything older, because a tree installed under the wrong Node fails later in
ways that never mention Node.

```bash
git clone https://github.com/KiwiCanopy/KiwiCV.git
cd KiwiCV
nvm use
npm ci
cp .env.example .env.local
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Local Setup

`.env.example` lists the variables a local setup uses; the
deployment's full list is in
[`.agent/wiki/ops/DEPLOYMENT.md`](.agent/wiki/ops/DEPLOYMENT.md). The two Supabase placeholders
it ships with are enough for the editor, the preview and the PDF
export — no account, no network service. Each further feature
needs its own service:

| Feature                    | Needs                                                                                                                                                                  |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Editor, preview, PDF, HTML | `VITE_SUPABASE_URL` + `VITE_SUPABASE_PUBLISHABLE_KEY` (placeholders are fine)                                                                                          |
| Sign-in                    | A real Supabase project (schema in [`supabase/schema.sql`](supabase/schema.sql)) with Google sign-in enabled                                                           |
| AI features                | Sign-in, a Pass on the profile (Stripe test mode, or `premium_until` set with the service role), `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_SERVICE_ACCOUNT_KEY` (Vertex AI) |
| Pass checkout              | Sign-in, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, prices with the lookup keys `pro_1_days`, `pro_7_days`, `pro_30_days`              |
| Google Drive backup        | Sign-in, `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` of the OAuth client configured as Supabase's Google provider, with the Drive API enabled                          |
| Blog (empty without them)  | `VITE_SANITY_PROJECT_ID`, `VITE_SANITY_DATASET`                                                                                                                        |
| Analytics                  | `VITE_POSTHOG_KEY` (production builds only)                                                                                                                            |

The serverless functions in `netlify/functions/` are not served by
`npm run dev`; run `npx netlify dev` (port 8888) to use them
locally.

The tests and the typecheck need no environment:

```bash
npx tsc -b    # the typecheck (npx tsc --noEmit checks nothing here)
npm test      # four runners: vitest, functions, i18n, lint baseline
```

## 📁 Project Structure

```
src/
├── components/       # UI building blocks
│   ├── editor/       # Resume section editors
│   ├── modals/       # Dialogs (export, import, sync)
│   ├── preview/      # Templates: HTML preview + Typst PDF serializer
│   └── ui/           # Base components
├── features/         # Feature blocks (Dashboard, Extras, Settings)
├── locales/          # 15 language trees
├── pages/            # Route entry points
├── services/         # External APIs (GitHub, Google Drive, analytics)
├── store/            # Zustand state (single source of truth)
└── utils/            # Formatting and logic helpers
netlify/functions/    # Serverless backend: AI jobs, checkout, Drive sync
supabase/             # Database schema and policies
.agent/wiki/          # Design and operations documentation
```

## 🤝 Contributing

Contributions are welcome — start with
[CONTRIBUTING.md](CONTRIBUTING.md), which covers the workflow, the
test gate and the [Contributor License Agreement](CLA.md).
[AGENTS.md](AGENTS.md) holds the repo's conventions, for humans and
AI assistants alike. Every user-visible string ships in all fifteen
languages; see [`.agent/wiki/ops/I18N.md`](.agent/wiki/ops/I18N.md)
for how translations flow.

Found a security problem? Please follow [SECURITY.md](SECURITY.md)
instead of opening an issue.

## 📝 License

Copyright (C) 2026 Maikel Hajiabadi.

KiwiCV is licensed under the
[GNU Affero General Public License v3.0](LICENSE). If you run a
modified version as a network service, the AGPL requires you to
offer your users its source code.

**Your CVs are yours.** Documents generated with KiwiCV, including
the template code an HTML export contains, may be used under any
terms you like. This is an additional permission under section 7 of
the AGPL; its exact wording and limits are in
[LICENSE-EXCEPTION.md](LICENSE-EXCEPTION.md).

The names "KiwiCV" and "KiwiCanopy" and their logos are not licensed
under the AGPL; see [TRADEMARKS.md](TRADEMARKS.md).

<div align="center">
<br>
<sub>A <strong>KiwiCanopy</strong> project — Because our time is precious 🥝</sub>
</div>
