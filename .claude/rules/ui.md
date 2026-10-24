---
paths:
  - 'src/components/**'
  - 'src/features/**'
  - 'src/pages/**'
  - 'src/layouts/**'
  - 'src/styles/**'
---

# Product UI

`code/DESIGN_LANGUAGE.md` and `code/UI_PATTERNS.md` are the reference — the north
star, the measured contrast ratios, the full rationale behind each ruling below.
This is what binds when you build or restyle a surface.

## Painted takes the fill, drawn takes the strong

> `bg-*` and `accent-*` take `--primary`. Everything else takes
> `--primary-strong`.

That covers `text-`, `border-`, `ring-`, `stroke-`, `decoration-`, `shadow-` and
gradient stops without inspecting the call site. Tints follow their own solid:
`bg-primary/10` is chromatic, `border-primary/30` and `ring-primary/50` keep the
drawn character.

`--primary` was one value doing both jobs, which capped its luminance at the
27–33% band where a white label is weakest. The split works only because
`--primary-foreground` flipped to ink; splitting alone buys almost nothing.

**Guarded twice, and both are needed.** `eslint.config.js` bans the drawn
utilities on bare `-primary` (zero exemptions, no `eslint-disable` anywhere in
`src/`), and `tests/lint/primary-role-split.test.mjs` asserts the token _values_ —
light's two differ, the foreground is not white, dark's two match. Without the
second, someone collapses the values back to one triple and every other check
still passes.

⚠️ **A tint alone cannot carry a selected state.** The chromatic `/10` has _less_
luminance separation than the ink one it replaced (1.11:1 vs 1.21:1). The gain is
hue, not contrast. Anywhere a tint is the sole marker, add a border or a mark.

## Control edges are `--input`; `--border` is decorative

A new interactive primitive takes `border-input`. `--border` sits at **1.35:1**
by design — it is a decorative divider, and 3:1 does not apply to it.

This is not a preference. `tokens.css` applies `border-border` to `*`, so one
1440×900 editor screen painted that hairline **75 times, ~23,800 linear px**, at
2.19:1. Green enough to read as colour, too weak to read as structure — the
mechanism behind "hard on the eyes".

⚠️ **In `.dark`, `--input` must stay lighter than `--border`.** They held the
identical value once, which made this whole rule a no-op in dark: moving a
control from one to the other changed nothing, and the boundary sat at 1.89:1.
Do not re-align them on the grounds that `--primary-strong` aliases its pair in
dark — that alias is argued, these two have opposite jobs in both themes, and
collapsing them silently reintroduces that no-op.

⚠️ **Lightening `--border` obliges you to re-check which primitives read it.**
The `border-border` → `border-input` migration had to land _first_, or a
secondary button's outline would have dropped to 1.35:1. `OptionCard` is the
entry to watch: it derives its edge from whether it rendered a `button` or a
`div` rather than stating one.

⚠️ **A light button on a TINTED panel takes `border-input` at the call site** (owner, 2026-09-03).
`secondary` and `quiet` are borderless by decision — but that decision was measured on `--card`. On
the AI proposal panel's `bg-kiwi/5` the secondary fill all but disappears in dark and `quiet` has no
fill at all, so the edge is again what identifies the control. Applied at
`features/dashboard/editor/proposals/`; cite this line rather than re-arguing it, and do not widen
it to buttons on the plain card, which is the coexistence `Button.tsx` names as the defect.

**A filled button has `border-transparent`** — kept rather than absent so filled
and light buttons keep the same height in a row. 1.4.11 binds only when the
_edge_ identifies the control, and a filled button is identified by its label.
**A light button is the opposite case**: `bg-card` on `--card` is 1.00:1, so the
edge _is_ the button and `--input` is mandatory.

## Banned in favour of the primitive

`eslint.config.js` fails the build on these. Files predating the guards are
frozen in `eslint-legacy-baseline.js`.

| Banned                                             | Use instead                     |
| -------------------------------------------------- | ------------------------------- |
| `btn-3d-*`, `badge-primary-3d`                     | `Button`, `IconButton`, tokens  |
| `@radix-ui/react-dialog`                           | `DialogFrame`                   |
| `@radix-ui/react-alert-dialog`                     | `ConfirmModal`                  |
| `AlertCircle`, `Loader2`, `XCircle`, `HelpCircle`… | `CircleAlert`, `LoaderCircle`…  |
| `clsx`                                             | `cn` from `@/utils/cn`          |
| `Wand2`, `WandSparkles`                            | `Sparkles` (AI), `Gift` (bonus) |

**AI is `Sparkles` in `primary`** — triggers and states alike. The wand ban is
semantic: the app used `Wand2` and `FilePenLine` interchangeably for "AI", so
changelog copy saying "look for the {wardsymbol}" rendered a wand while the
editor showed a pencil.

⚠️ `WandSparkles` is banned **by name** because it _is_ `Wand2`, renamed
upstream. `importNames` matches a spelling, not an export identity, so banning
only the old name lets the same glyph back in under the new one.

**Amber is reserved for warning and paid/premium.** The AI trigger must not
borrow it — the paywall a visitor hits right after pressing that trigger is
amber.

**Lime is the AI run's, not Export's.** The header Export button is ink
(`bg-foreground`); a lime primary near the composer gets pressed for Improve
(#27, `UI_PATTERNS.md`).

**The legacy baseline only shrinks.** Delete a file's entry in the same commit
that migrates it; `tests/lint/legacy-baseline.test.mjs` fails on a stale entry,
so a migrated file cannot keep its exemption.

## Every flow covers eight states

Loading, empty, error, disabled, success, hover, pressed, and visible keyboard
focus. Then verify mobile, narrow editor, tablet and desktop; dark mode; reduced
motion; contrast; screen-reader names; keyboard navigation.

**Keep unavailable controls visible and disabled with a concise reason** rather
than hiding them — unless another control takes the slot, as the composer's
entry button does for its run (#27, `UI_PATTERNS.md` § AI composer bar). Place a control beside the thing it affects. Animate transforms
and opacity, never layout properties, and never make perpetual decoration a
prerequisite for understanding the product.

## Voice: friendly expert

Calm, supportive, precise. Concrete about benefit _and_ limitation. No
"gamechanger", "seamless", "unleash".

German is informal and **lowercase** — `du`, `dir`, `dein`. Shipped German runs
405 mid-sentence lowercase to 47 capitalized, so the capitals are drift, not a
second convention. `code/DESIGN_LANGUAGE.md` said `Du/Dein` until 2026-09-03 and
contradicted `ops/CHANGELOG.md`, which is how the drift got in.

**The same intent holds in every language that distinguishes**: Spanish
`tú`, French `tu`, Portuguese `tu`, Russian `ты`, Ukrainian `ти`, Bulgarian
`ти`, Turkish `sen`, Polish and Dutch informal imperatives. Chinese uses `你` in the UI (owner, 2026-10-12; legal text keeps `您`)
and Japanese keeps its polite form — measured from what it ships everywhere, not an
exception to argue.

`.claude/rules/i18n.md` owns the rest of the voice rule — KiwiCV or the user is
the subject, never "we" — and loads whenever you touch a locale file.
