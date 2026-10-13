# KiwiCV Design Language

> **Last Updated: 2026-09-07** | [Wiki Index](../INDEX.md)

## Contents

- [North Star](#north-star)
- [Product Hierarchy](#product-hierarchy)
- [Interaction Conventions](#interaction-conventions)
- [Visual Direction](#visual-direction)
- [Voice](#voice)
- [Required States and Accessibility](#required-states-and-accessibility)
- [First Redesign Release](#first-redesign-release)
- [First Release Implementation](#first-release-implementation)
- [Validation](#validation)
- [Design Editor Implementation](#design-editor-implementation)

> [!IMPORTANT]
> **The token roles and the settled rulings bind, and they are in
> `.claude/rules/ui.md`**, which loads when you edit anything under
> `src/components/`, `src/features/`, `src/pages/`, `src/layouts/` or
> `src/styles/`. This page keeps the measurements and the reasoning — read it
> when you need to know _why_, or before overturning one.

## North Star

KiwiCV optimizes for **simplicity and intuitiveness, in that order**. The
interface should feel immediately understandable without limiting expert
workflows. Prefer familiar, accessible web conventions unless a different
pattern is demonstrably clearer in user testing.

The companion principle is **approachable by default, powerful on demand**.
New users begin with good defaults and a short path to a finished CV. Advanced
AI controls, versions, sync, raw JSON, and detailed design options remain
discoverable through progressive disclosure rather than competing with the
primary task.

## Product Hierarchy

The primary journey is:

1. Create or import a CV.
2. Edit while seeing the live result.
3. Tailor content when useful.
4. Export or save confidently.

Navigation, action hierarchy, onboarding, and empty states should prioritize
this journey. Sync configuration, JSON, detailed AI behavior, version history,
and advanced visual controls form a secondary layer that remains easy to find.

## Interaction Conventions

- Group controls by user goal or topic, not by widget type.
- Place a control beside the content, setting, or preview it affects.
- Keep unavailable controls visible and disabled with a concise reason instead
  of hiding them.
- Let the live CV preview lead editors that change visual output.
- Use contextual help for longer explanations; labels identify rather than
  teach.
- Match controls to meaning: direct fields for exact values, sliders for visual
  proportions, and segmented controls for small mutually exclusive sets.
- Stage or preview changes when experimentation could otherwise cause an
  unwanted destructive result.
- User-facing language may differ from internal vocabulary when that makes the
  product clearer.

## Visual Direction

KiwiCV shares family DNA with KiwiCanopy through restrained kiwi geometry, a
green/deep-teal family, and selective "by KiwiCanopy" endorsement.

- Use one brand accent family; reserve other colors for semantic status.
- Prefer whitespace, typography, dividers, and grouped surfaces over repeated
  cards, glow effects, or unnecessary elevation.
- Use kiwi imagery sparingly as a functional motif, not an omnipresent mascot.
- Build recognition through a small repeatable motif kit: seed-dot clusters,
  gentle fruit-slice arcs, and the approved green/deep-teal accent may mark
  progress, loading, success, section transitions, or one focal action. Use at
  most one motif per local composition and never obscure controls or CV content.
- Let the product feel fresh and warm through microcopy and motion, but keep
  fruit puns rare enough that guidance, legal copy, errors, and professional
  workflows remain direct.
- Keep generated CV themes independent from product chrome and brand colors.

### Exported documents carry no KiwiCV mark

The rule above extends past the page itself to **anything the exported file
declares** — its tab icon included. Whose professionalism is on the line in an
exported CV is the _applicant's_, and many would rather not advertise the tool to
the employer opening the file.

⚠️ **Decided three times before it was written down here.** A hosted
`/logos/kiwicv/favicon.ico` once shipped in the HTML export's `<head>`; it was
reverted, and the replacement is a neutral grey silhouette inlined as a data URI. A
ruling that lives only in a code comment gets re-litigated by whoever next
notices the export has no icon.

What this permits: a neutral glyph, chosen for legibility at 16px. What it does
not: the kiwi, the wordmark, brand colours, or a link to a KiwiCV-hosted asset —
which also makes the export depend on the origin being reachable.

⚠️ **The PDF export is out of scope, not exempt.** Chrome's built-in viewer
requests no favicon at all — measured, including for a PDF served from a normal
https origin with a valid one — so the tab glyph there belongs to the viewer and
cannot be set either way. Its metadata is in scope: the PDF's title and author
carry only the applicant's name (`getTypstDocumentMetadata`), and are omitted when
the name is empty rather than filled with the product name.

- Standardize typography, icon style, radii, elevation, spacing, and motion
  before page-level redesign implementation.
- Avoid generic AI-SaaS patterns, unverifiable claims, fear framing, and visual
  effects that compete with the user's CV.

The owner approved the first Step 2 token package on 2026-07-19. Product chrome
uses local Inter at 400, 500, 600, 700, and 800. The semantic roles are:

| Role           | Token                        | Light     | Dark      |
| -------------- | ---------------------------- | --------- | --------- |
| Canvas         | `--background`               | `#F4F8F4` | `#182620` |
| Surface        | `--card`                     | `#FFFFFF` | `#21332B` |
| Subtle surface | `--secondary` / `--accent`   | `#E5EDE6` | `#293D34` |
| Primary text   | `--foreground`               | `#0E241B` | `#F4F7F5` |
| Muted text     | `--muted-foreground`         | `#4C6357` | `#B7C5BD` |
| Border         | `--border`                   | `#C8D6CA` | `#3B4E44` |
| Control edge   | `--input`                    | `#6B8174` | `#6B8B78` |
| Primary action | `--primary`                  | `#A9CB59` | `#A9CB59` |
| Primary drawn  | `--primary-strong`           | `#14503E` | `#A9CB59` |
| Kiwi accent    | `--kiwi`                     | `#A9CB59` | `#A9CB59` |
| Mist           | `--mist`                     | `#D8E5DA` | `#31473D` |
| Pass accent    | `--premium`                  | `#F6BF31` | `#F3C349` |
| Pass deep stop | `--premium-deep`             | `#F59F0A` | `#F3A620` |
| Pass label     | `--premium-foreground`       | `#12251A` | `#12251A` |
| Destructive    | `--destructive` / `--danger` | `#BE272F` | `#E57D76` |
| Info           | `--info`                     | `#1D67C9` | `#74A6E7` |

**Muted text is the floor for information.** `--muted-foreground` clears 4.5:1
on `--card` (6.5:1 light, 7.5:1 dark); any opacity under it does not —
`/60` is 2.7:1 light, and even `--foreground` at `opacity-60` is 4.4:1. Text a
user reads (dates, subtitles, counts) steps down from its title by size and
weight, never by opacity; the modifiers are for icons and dividers, which 3:1
governs.

### The Ink rail palette (2026-09-01)

The teal is gone and colour is spent on **zones** — whole surfaces stepping by
value in one hue — rather than on hairlines. The nav column is the darkest
surface on screen and the editor the lightest; that one dark edge is what makes
the middle read as bright instead of washed out, and it is the first ground the
kiwi green has ever had that it can carry (7.90:1).

`--primary` is now `#A9CB59` in **both** themes with an ink label at 8.84:1, so
the two themes stop disagreeing about what a primary action is. Every drawn
green collapses into one deep pine, `#14503E`.

⚠️ **The fill is still low against its surface** — kiwi on `--card` is 1.85:1,
lower than the teal's 2.49:1. That is accepted, not overlooked: 1.4.11 does not
bind a filled button whose label identifies it, and the label is 8.84:1. What
changed is that salience now comes from the dark nav and the zone ladder rather
than from the button fighting its own background.

| Zone token                | Surface                        | Light     | Dark      |
| ------------------------- | ------------------------------ | --------- | --------- |
| `--nav`                   | App sidebar                    | `#102E25` | `#0F1A15` |
| `--nav-foreground`        | Nav labels and icons           | `#8FAB9C` | `#9DB2A6` |
| `--nav-foreground-strong` | Selected / hovered nav label   | `#EAF3EC` | `#F4F7F5` |
| `--nav-active`            | Selected nav row               | `#1C4033` | `#25392F` |
| `--nav-border`            | Nav dividers                   | `#1E4437` | `#26382F` |
| `--rail`                  | Editor section rail            | `#E5EDE6` | `#131F1A` |
| `--rail-active`           | Selected rail row              | `#FFFFFF` | `#2B4036` |
| `--workspace`             | Editor column behind the cards | `#F4F8F4` | `#182620` |
| `--desk`                  | Behind the CV page             | `#DCE5DE` | `#1C2B24` |
| `--divider`               | Resize seam                    | `#EDF2ED` | `#2A3D33` |

⚠️ `--nav-foreground-strong` is named that way on purpose. The accent-label
guard in `tests/lint/primary-role-split.test.mjs` derives families from every
`--X-foreground:` and requires an `--X` fill to exist; naming it
`--nav-strong-foreground` invented a family called `nav-strong` and failed the
suite. Anything ending in `-foreground` must have a fill of the same stem.

⚠️ `--nav-foreground-strong`, `--nav-border` and `--rail-active` are **not** in
the palette source's summary table — they come from the variables its own screen
mock sets. Without a bright nav ink a selected row falls back to `--foreground`,
which is ink, and the wordmark disappears on the dark rail. Do not delete them
as undocumented.

⚠️ A component that paints a zone reads its zone token, never `--background`.
Falling back flattens the ladder to where it started.

⚠️ Elevation is theme-specific now. Light `--elevation-1` is a near-black blur
at 6% alpha, which is invisible on a dark card; dark takes a stronger blur plus
an inset top rim, since on a dark surface a lighter edge is what reads as raised.

> Hex values are **derived**, not authored — `src/styles/tokens.css` stores HSL
> triples and these are the conversions. Recompute from the token before
> trusting a hex here; four light values and one dark value in this table were
> stale teal-era colours until 2026-07-24. The `Token` column tells you which
> declaration to read.

> ⚠️ **There was a second paid family, and its removal is worth knowing about.**
> `--credits`, `--credits-deep` and `--credits-foreground` were deleted on
> 2026-09-03 with the credits system they painted. They **inverted between
> themes** where `--premium` does not — light was a dark green under a white
> label, dark a light green under an ink one — and a hardcoded `text-white` on
> the dark fill measured **1.75:1** and shipped that way until review caught it.
> Read the label token rather than assuming, if a second family is ever added.
>
> `--premium`'s stops travel through **hue**, not only lightness (43°→38°); that
> travel is what makes the pair read as a gradient instead of one colour
> fading.

Controls/cards/panels/features use 8/12/16/24 px radii. Motion uses 140/200/280
ms ease-out durations, and elevation is limited to the two approved subtle
shadows. The two-layer focus treatment uses a 2 px local-surface separator and
3 px ink outer ring in light mode or mist outer ring in dark mode; forced
colors uses the system outline. Reduced motion removes nonessential transforms
and transitions. These variables live in `src/styles/tokens.css` and never flow
into generated CV themes.

### A clipping track draws the focus ring inward (2026-09-07)

The two-layer treatment above assumes the ring has room _outside_ the control.
`SegmentedToggle` does not give it any: the track is `overflow-hidden` with a
3 px gutter, so the standard `outline-offset: 2px` and the 2 px separator both
land in — or past — that gutter and are clipped away.

The primitive answered that with `outline-hidden` on every segment. A class
selector out-specifies the `:where(a, button, …):focus-visible` base rule, so the
outline never painted at all and only the separator survived: measured
`rgb(255,255,255)` on a `--card` thumb, **1:1**, and 1.18:1 / 1.35:1 in dark. A
keyboard user could operate the control and not see it.

**The ruling: keep the ring's colour and weight, move it inside, and drop the
separator — through the variables, not through a utility on the child.**

`tokens.css` publishes two hooks on the base rule:

```css
outline-offset: var(--focus-offset, 2px);
box-shadow: var(--focus-separator-shadow, 0 0 0 2px hsl(var(--focus-separator)));
```

and a clipping container re-points them on itself, exactly the rung `.bg-nav`
uses for the ring's colours:

```
--focus-offset: calc(-1 * var(--seg-gutter));
--focus-separator-shadow: none;
```

That keeps the geometry in `tokens.css` rather than re-specifying it per child,
and it ties the inward offset to `--seg-gutter` — the same number the padding,
the thumb inset and the thumb width read — so the offset cannot drift out of
agreement with the gutter it exists to clear.

Dropping the separator is deliberate. It holds the ring off a surface it might
merge into, and there are exactly two surfaces here: the `--card` thumb and the
`--muted` track. Measured in the running app on three surfaces (`DashboardTabs`,
`PreviewHeader`, and the date picker's pill toggle), in both themes, selected and
unselected:

|                                     | vs thumb (`--card`) | vs track (`--muted`) |
| ----------------------------------- | ------------------- | -------------------- |
| Light — ink ring `rgb(14,36,27)`    | **16.32:1**         | **13.67:1**          |
| Dark — mist ring `rgb(244,247,245)` | **12.38:1**         | **10.75:1**          |

Every one far past 1.4.11's 3:1, so the separator was buying nothing and its
outward spread was the artefact being measured.

⚠️ **`outline-hidden` is the wrong answer to a clipped ring, anywhere.** It does
not move the indicator, it deletes it, and it wins the cascade while looking like
a reset. `src/` carries none; `tests/lint/focus-ring-suppression.test.mjs` fails
on a new one, and also fails if the offset stops being derived from the gutter.

⚠️ `focus-visible:outline-none` is a different thing and is not banned. It is
half of the `outline-none` + `ring-*` treatment used at 38 sites, which paints —
and the `forced-colors` block in `tokens.css` is **unlayered**, so it outranks
every Tailwind utility and restores `outline: 3px solid CanvasText` there
regardless of the class string.

### Control edges are `--input`, decorative dividers are `--border` (2026-08-27)

`--input` used to duplicate `--border`, so every control boundary in the app was
the same `#89B589` hairline as every decorative divider — **2.32:1 on `--card`,
2.19:1 on the canvas**, both under the 3:1 WCAG 2.2 non-text minimum. Because
`tokens.css` applies `border-border` to `*`, that hairline was also the default
for anything that did not opt out: one 1440x900 editor screen painted **75 of
them, roughly 23,800 linear px**. A mid-green saturated enough to read as colour
but too weak to read as structure, repeated 75 times, is the mechanism behind
"hard on the eyes".

The two roles are now separate. `--input` is `145 12% 48%` (`#6C8978`) and means
**a control boundary**: 3.83:1 on `--card`, 3.61:1 on the canvas, 3.44:1 on
`--muted`, 3.18:1 on `--mist`. `--border` is unchanged and means a decorative
divider, where 3:1 does not apply.

⚠️ **A token change alone would have made this worse.** `Input`, `TextArea` and
`Select` were the only primitives reading `border-input`; `Button`,
`SegmentedToggle`, `AISuggestButton`, `Switch` and `LocaleSelect`
all read `border-border`, so lightening `--border` later without moving them
would drop a secondary button's outline to 1.35:1. The primitives moved in the
same change set as the token, and any future `--border` lightening must check
that list again — `OptionCard` joined it later, and it is the one entry that
derives its edge from whether it rendered a `button` or a `div` rather than
stating one.

⚠️ **In `.dark`, `--input` is lighter than `--border` and must stay so.** The
two once held the identical value (`148.4 13.9% 26.9%`), which made this
whole rule a no-op in dark: moving a control from `--border` to `--input`
changed nothing, and the boundary sat at **1.89:1** against `--card`, under
1.4.11's 3:1. Every control-edge fix before that bought light mode only.

Dark `--input` is now `148.4 13.9% 40%` — **3.28:1**. 38% was the true floor at
3.02:1, which rounds to the minimum and leaves nothing for a later `--card`
tweak, so 40% is the smallest step with headroom.

It matters most where the edge is the sole resting affordance. On `OptionCard`
the chevron sits at `text-muted-foreground/30` — about 1.52:1 light, 2.03:1 dark
— so the border really is what separates a clickable option from a static tile.

⚠️ Do not re-align the two dark values on the grounds that `--primary-strong`
aliases its pair in dark. That alias is argued: one light value genuinely serves
as both a fill and as text on a dark card. These two have opposite jobs in both
themes, and collapsing them silently reintroduces the dark-mode no-op.

Two fills were the same colour as the surface they sat on and are now `bg-card`:
`AISuggestButton` idle (**1.00:1** against the editor column — arithmetically
invisible, only its icon separated it), and `SegmentedToggle`'s selected thumb
(**1.05:1** against its own track — the app's Edit/Design switcher and the AI composer's mode toggle marked their
selected state with a colour that was not there). The thumb also takes
`--elevation-1`, one of the two approved shadows; no new elevation is introduced.

### The light surface ladder, and one green family (2026-08-27)

The light palette spent its chroma on neutrals and hairlines instead of on
anything meaningful, which is what "hard on the eyes" measured out to:

- `--card` white over the canvas was **1.06:1** — not a tonal step, a pure hue
  shift, with achromatic white sitting on a 90 degree hue at 25% saturation.
  Nothing on screen read as layered.
- Separation therefore fell entirely on `--border`, which one 1440x900 editor
  screen painted **75 times, roughly 23,800 linear px**, at 2.19:1. A mid-green
  saturated enough to read as _colour_ but too weak to read as _structure_.
- The light block held **8-9 near-but-not-equal greens across a 100 degree arc**
  (77.9, 79, 84, 90, 101.1, 120, 137.8, 145.3, plus a 177.7 teal), against a
  brief that says one brand accent family. Nine almost-matching greens is what
  made the screen read as slightly off rather than coordinated.

The surfaces now sit in one hue family at 140-145 and step by lightness rather
than by hue: canvas `140 15% 95%`, subtle `140 20% 92%`, mist `140 22% 90%`,
muted text `145 12% 38%`. `--card` over canvas is **1.11:1** — small, but a
tonal step in one family rather than a hue break.

⚠️ **`--border` is now decorative only, at 1.35:1.** That is deliberate, not a
regression: structure moved to `--input` (3.83:1 on card, 3.45:1 on canvas,
3.27:1 on subtle), which is why the `border-border` to `border-input` migration
across Button, SegmentedToggle, AISuggestButton, Switch and
LocaleSelect had to land **first**. Lightening `--border` before that migration
would have dropped a secondary button's outline to 1.35:1 and made things worse.

`--muted-foreground` also leaves the 177.7 teal for 145, joining the family, and
gains margin while doing it: 5.62:1 on card, 5.06:1 on canvas, 4.79:1 on subtle
(it was 4.65:1 there, 0.15 above AA — too thin for a token at this many sites).

`--kiwi`, `--success`, `--warning` and `--destructive` are untouched: semantic
roles and the brand fill are meant to sit outside the neutral family.

### `--primary` split into a fill and a drawn role (2026-08-28)

**This supersedes the entry below.** The owner accepted ink "for now"; the split
is what reopened it, and the light primary is now a bright teal.

`--primary` did two jobs — the fill of `bg-primary`, and the colour of
`text-primary` at ~200 sites. One value had to clear 4.5:1 as text on `--card`,
`--background` _and_ `--secondary`, which caps its luminance at **0.1491**. That
is the 27-33% lightness band every rejected candidate sat in, and a mid-tone fill
is exactly where a white label is weakest.

**The rule, and it is one sentence:**

> `bg-*` and `accent-*` take `--primary`. Everything else takes
> `--primary-strong`. Painted takes the fill; drawn takes the strong.

That covers `text-`, `border-`, `ring-`, `stroke-`, `decoration-`, `shadow-` and
gradient stops without inspecting the call site. Tints follow their own solid, so
`bg-primary/10` is chromatic while `border-primary/30` and `ring-primary/50` keep
their character.

⚠️ **Splitting alone buys almost nothing.** It moves the ceiling from 0.1491 to
0.1833 — HSL ~30% to ~33%. The gain comes from `--primary-foreground` flipping
from white to ink, which changes the binding constraint to ink-on-fill and drops
the floor to **L >= 0.2437**. The fill is 2.4x brighter than the deepest teal
previously proposed _because_ its label is dark. White on it is 3.23:1.

⚠️ **The primary button has no border at all — `border-transparent`.** An
earlier revision gave it a `--primary-strong` rim, on the reasoning that the
fill's 2.49:1 edge fails the 3:1 non-text minimum. That reasoning misreads the
rule: 1.4.11 binds only when the _edge_ is what identifies the control. A filled
button is identified by its label — ink on teal is 6.46:1 — so the edge carries
nothing and needs no contrast. The rim was removed; the class
stays `border-transparent` rather than absent so filled and light buttons keep
the same height and align in a row.

The light variants are the opposite case, and the reason the rule is stated per
role rather than globally: `bg-card` on `--card` is 1.00:1, so for those the
edge **is** the button and `--input` is mandatory.

⚠️ **`.dark` aliases the two on purpose.** Dark surfaces are dark, so one light
value already works as a fill (ink on it, 8.71:1) and as text (9.08:1 on dark
`--card`). Light and dark are now structurally identical — bright brand-family
fill, ink label — and differ only in hue, which is the cross-theme disagreement
this thread started from.

**Guarded twice, because one is not enough.** `eslint.config.js` bans the drawn
utilities on bare `-primary` — zero exemptions, and no `eslint-disable` for it
anywhere in `src/`. `tests/lint/primary-role-split.test.mjs`
asserts the token _values_: light's two must differ, the foreground must not be
white, and dark's two must match. Without the second, someone collapses the
values back to one triple and every other check still passes.

**Not fixed by this:** ~80 `bg-primary/*` tints become pale cyan rather than pale
grey-green. Every pairing clears AA, but the chromatic `/10` has _less_ luminance
separation than the ink one it replaces (1.11:1 vs 1.21:1) — the gain is hue, not
contrast. Anywhere a tint is the sole carrier of a selected state still needs a
border or a mark.

### The light primary action stays ink, for now (2026-08-27)

Light `--primary` is byte-identical to `--foreground`, so the primary button is
body text: white on it is 16.09:1, the same ratio a paragraph has, because it is
the same colour. Dark's `--primary` is the brand green, so light is the only
theme whose primary action carries no brand at all. **That is a real defect and
it is still open.**

**A green primary was proposed, measured, rendered in the running app and
rejected by the owner** — twice. `95 45% 27%` read as moss (hue 95 is
yellow-green; darkening a yellow-green gives olive at every lightness). Five
follow-ups in the 142-198 band — jade, true green, pine, deep teal, petrol, all
between 5.8:1 and 6.6:1 white-on-fill — were rejected as a group, and the
owner's reason is measurable rather than a matter of taste: **every candidate
sits at 27-33% lightness, so white on it is ~6:1 against ink's 16.09:1.** The
label is about 2.5x less legible. Asking for "strong but not too strong" pushed
the whole search into mid-tones, which is exactly where white text is weakest.

Darker chromatic values keep the legibility — `152 55% 15%` is 12.50:1,
`188 55% 15%` is 13.01:1 — but at that lightness the hue barely reads, so they
fix the defect on paper without delivering the brand presence that motivated it.

**The conclusion, and the reason nothing shipped here:** the button was the
smaller half of the diagnosis. `--card` over `--background` is 1.06:1 — a hue
shift with no tonal step — one 1440x900 editor screen paints **75 `--border`
edges, ~23,800 linear px** at 2.19:1, and the light palette holds **8-9
near-but-not-equal greens across a 100 degree arc**. Surfaces and hairlines are
where "hard on the eyes" lives, and none of it is a button. Do that work first,
then look at the ink button again against calm chrome.

⚠️ Do not re-run the candidate search before the surface work lands. It has been
run twice and the constraint that killed both rounds — mid-tone fills lose white
text — is a property of the lightness band, not of the hues tried.

### Heading weight (2026-07-23)

Product-chrome headings are **weight 800** (`font-extrabold`), served by a real
`inter-latin-800-normal.ttf`. They were once split across 600, 700, and
900; the nine `font-black` (900) headings were browser-synthesized, since 700
was the heaviest face shipped. `font-black` now resolves to the 800 face too —
CSS font matching walks upward from the requested weight first, and 800 is the
heaviest face we ship.

**A global `h1, h2, h3 { font-weight: 800 }` base rule was considered and
rejected.** KiwiCanopy-web uses one (`src/styles/global.css:71`), but in this
repository it would be inert: every `h1`–`h3` in `src/` already carries an
explicit weight, either a Tailwind utility class (specificity `0,1,0`) or an
inline `style`, and both outrank an element selector in `@layer base`
(`0,0,1`). The rule would lose everywhere it was meant to win.

The place it _would_ take effect is the one place it must not. 36 of the 97
`h1`–`h3` are CV-theme components, and the HTML preview renders in the app
document rather than an iframe — only the PDF is iframed. A base rule is
therefore one forgotten `fontWeight` away from reaching generated CV output,
which this document keeps isolated from product chrome. A per-component sweep
has no such reach.

**Four headings are deliberately excluded.** The editor primitives form a
nesting ladder where weight falls as depth increases, stated in their own
in-file comments:

| Level                              | Size/weight | Source                          |
| ---------------------------------- | ----------- | ------------------------------- |
| Page title                         | 24px/800    | e.g. `Extras.tsx`               |
| `Section` `variant="page"` `h2`    | 20px/700    | `ui/section/SectionPage.tsx`    |
| `Section` `variant="default"` `h2` | 18px/600    | `ui/section/SectionDefault.tsx` |
| `Section` `variant="nested"` `h3`  | 16px/600    | `ui/section/SectionNested.tsx`  |
| `AccordionItem` `h3`               | 14px/500    | `ui/Accordion.tsx:124`          |

**Updated 2026-08-09.** `SectionGroup` is deleted — the
editor's five accordion groups became the persistent section rail, and its
18px/700 rung is now `Section`'s new `page` variant at 20px/700. That variant is
the rail's mounted section, so it is the only `Section` header that is _the_
heading of the pane rather than one card in a stack.

**Corrected the same day, after the owner's review.** The editor no longer paints
a page title at all: the tab bar and the section heading already name where you
are, so the 24px/800 row and its subtitle were spending vertical space to restate
their own chrome. `EditorTab`'s `h1` survives as `sr-only` — it is the pane's only
top-level heading and the ladder would otherwise open at `h2` — so the visible top
rung in the editor is now the `page` variant's 20px/700.

Raising any of these to 800 inverts the hierarchy, and because they are shared
primitives it would do so everywhere at once. The sweep improved the ladder
instead: the editor's page title was `font-semibold` (600), _below_ the
`SectionGroup` header that sits inside it. At 800 the page title finally
outranks its own content.

Hierarchy among swept headings is carried by **size, not weight** — a landing
section `h2` and its card `h3` are both 800 and differ in size.

## Voice

The canonical English and German voice is **friendly expert**:

- calm, supportive, precise, and transparent;
- confident without hype or shouting;
- concrete about user benefit and limitations;
- informal, **lowercase** `du/dir/dein` in German (this line read `Du/Dein`
  until 2026-09-03 and contradicted `ops/CHANGELOG.md`; shipped German runs 405
  mid-sentence lowercase to 47 capitalized, so the capitals are drift);
- free of generic AI copy such as "gamechanger", "seamless", or "unleash".

Approve English copy before the other 14 locales are written from it.

## Required States and Accessibility

Every redesigned flow must cover loading, empty, error, disabled, success,
hover, pressed, and visible keyboard-focus states. Verify mobile, narrow editor,
tablet, and desktop layouts; dark mode; reduced motion; contrast; screen-reader
names; and keyboard navigation.

Motion should clarify state or hierarchy. Animate transforms and opacity rather
than layout properties, and never make perpetual decoration a prerequisite for
understanding or operating the product.

## First Redesign Release

The first Step 2 release covers the landing page and app shell after the Step 1
rename is stable. The landing information architecture is:

1. Concise promise and credible product demonstration.
2. Create, tailor, and export/save workflow.
3. Proof and differentiators.
4. Privacy and data ownership.
5. Pricing.
6. Focused FAQ and closing action.

Founder history and deeper ATS/AI explanations move to About, blog, or
progressively disclosed detail. Deeper editor/settings redesign remains a later
roadmap package.

## First Release Implementation

The approved six-block landing page and app shell were implemented on
2026-07-19. The shell keeps a compact desktop rail that expands over the
workspace and a mobile drawer. Navigation prioritizes Builder and My CVs,
groups Blog under Learn, and progressively discloses Extras, Resume data, and
Settings under More. UI language is available in the sidebar utility area and
remains distinct from the CV document language. Both controls use neutral
locale codes and localized language names rather than country flags. The shell
shows local automatic-save status once beside the CV identity; Back up is a
separate cloud-upload action for the user's own Google Drive or GitHub storage.

The landing footer carries a restrained `KiwiCV by KiwiCanopy` endorsement with
the compact parent-brand PNG. The full wordmark artwork remains available for
larger contexts. The endorsement text links to the KiwiCanopy parent site
(`https://kiwicanopy.com`) now that the destination is live (2026-07-24);
the compact PNG stays decorative (`alt=""`) so the accessible name comes from
the endorsement text. The footer stays a single restrained parent endorsement —
sibling-product links (KiwiCanopy, KiwiDesk) live in Extras → About, not here.
Stripe's current product terminology is canonical for pricing: use `Pass`, not
`Pro Pass` or `Premium Pass`. Five affected pricing strings and sixteen
restored roadmap strings are still owed to the packet — since 2026-09-07 that is
work the agent does, and it is the first thing the new rule should clear.

Roadmap status follows shipped changelog evidence — but the **stamp happens at
feature-merge time, not at release**. `RoadmapTab`'s `version` field records the
release the feature is _going into_, and is flipped in the same commit that
finishes the feature; `src/data/changelog.ts` only gains the matching row when
`release.cjs` runs. Between those two moments the card renders
`V<version> • ` with no date, and its `?tab=changelog&v=<version>` deep link is
ignored, because `changelog.find(...)` returns `undefined`. That is the normal
in-flight state and it self-heals when the release is cut.

⚠️ Recorded 2026-09-08 because the sentence above, read alone, says the
opposite. The practice is older than the sentence: an earlier change stamped
`matching_cover_letters` as `4.1.0` while `package.json` was `4.0.1` and
`changelog.ts` had no `4.1.0` row, and a later change did the same for
`ai_cover_letters` at `4.4.0`. Do not "correct" a stamped-but-unreleased version
back to `done: false` — check whether that release is simply still in flight.

Mobile editing, live
preview, and flexible layout are released in 2.0.0; cloud backup and AI-assisted
import/tailoring are released in 3.0.0. The abandoned color chooser is not a
planned item. Roadmap cards use concise English fallback copy rather than
exposing raw localization keys, pending the packet pass above.

Responsive preview behavior is based on measured workspace content width:

- at 767 px or less, the editor stays primary and no hidden/live Viewer mounts;
  a separate Preview action offers localized PDF and HTML choices;
- from 768 through 1179 px, Edit, Design, and Preview are full-width modes;
- at 1180 px or more, the keyboard-operable resizable live split mounts.

The phone preview opens a blank tab synchronously, exposes opening, generating,
opened, popup-blocked, and render-failure states, and keeps Export separate.
Generated CV themes remain isolated from product-chrome tokens.

Source-level validation and local automation pass. Browser-visible responsive,
forced-color, zoom, screen-reader, and assistive-technology validation remains
required because no browser surface was connected during implementation.

## Validation

Compare onboarding completion, time to first export, landing CTA conversion,
errors, and help interactions against the pre-redesign baseline. A redesign is
not complete if it weakens first-time or advanced workflows, responsive
behavior, accessibility, or CV rendering.

## Design Editor Implementation

Phase 7.4 groups the mounted Design editor into Template, Layout, Typography,
and Details disclosures, with Template open initially. Each closed group keeps a
concise current-state summary, while its controls remain mounted so local mirror
state and preview synchronization are preserved.

Template and palette choices expose semantic selected states. Section and
custom-address ordering keep drag-and-drop as an enhancement and provide
permanent Move up/Move down controls plus localized live announcements. Two-
column sections retain a named cross-column movement action, visibility, edit,
page-break, and sidebar-position controls.

Design controls no longer dim the complete editor while Typst updates. The
mounted preview owns synchronization and generation status locally; narrow
layouts without a live preview therefore remain usable after every change. The
generated HTML and Typst templates remain independent from KiwiCV product
chrome.
