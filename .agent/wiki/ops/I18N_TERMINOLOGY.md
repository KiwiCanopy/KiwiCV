# Translation Terminology

> **Obligations live in `.claude/rules/i18n.md`**, which loads whenever you edit
> `src/locales/**` or `scripts/i18n/**`. This page decides **which words stay
> English and which get translated**, so a value can be judged without speaking
> the language.
> **Last Updated: 2026-10-06**

Written on 2026-09-07, when the owner ruled that the agent authors all fifteen
locales (`.claude/rules/i18n.md`). Until then a human translator carried
terminology in their head. Nothing wrote it down, so this page derives it from
what the locales already ship — every rule below is a description of shipped
values before it is a rule.

The cases the shipped values could not settle on their own — `Pass` and
`token`/PAT (2026-09-08), German `Template` (2026-10-06) — were ruled on by the
owner and are recorded below.
Nothing on this page is open.

## Contents

- [The four classes](#the-four-classes)
- [Class 1 — names that never change](#class-1--names-that-never-change)
- [Class 2 — formats and identifiers](#class-2--formats-and-identifiers)
- [Class 3 — concepts that look like names](#class-3--concepts-that-look-like-names)
- [Class 4 — ordinary product vocabulary](#class-4--ordinary-product-vocabulary)
- [The three dismissal controls](#the-three-dismissal-controls)
- [`token` / PAT — decided 2026-09-08](#token--pat--decided-2026-09-08)
- [`Pass` — decided 2026-09-08](#pass--decided-2026-09-08)
- [German `Template` — decided 2026-10-06](#german-template--decided-2026-10-06)
- [`Fair Use Policy` — decided 2026-10-12](#fair-use-policy--decided-2026-10-12)
- [When this page is silent](#when-this-page-is-silent)

## The four classes

Every user-facing noun falls into one of four, and the class decides the
treatment. Two markers on a `scripts/i18n/handoff-catalog.cjs` row enforce
classes 1 and 2, so a class-1 or class-2 term in a string is a reason to add the
row, not just a note:

- **`protectedTokens`** — the term sits _inside_ a string the locale otherwise
  translates (`Save to Google Drive`). `handoff-validation.cjs` requires the
  token to survive verbatim; the rest of the sentence is the locale's.
- **`VERBATIM`** — the _whole_ value is the name or format, and the
  correct value is the English in **all fourteen** locales (`Google Drive`,
  `https://...`, `PDF`). The generator pre-fills it, the importer rejects any
  other value, and `tests/i18n/verbatim-rows.test.cjs` fails if a locale drifts.
  A value some locales legitimately rewrite (a date pattern, a sample employer)
  is not `VERBATIM`; it may still protect a token.

| class                            | treatment                 | enforced by                               |
| -------------------------------- | ------------------------- | ----------------------------------------- |
| 1. Names                         | verbatim, every locale    | `protectedTokens`, or `VERBATIM` if whole |
| 2. Formats and identifiers       | verbatim, every locale    | `protectedTokens`, or `VERBATIM` if whole |
| 3. Concepts that look like names | **localized**, per locale | ⚠️ never either                           |
| 4. Ordinary vocabulary           | translated                | nothing — this page                       |

## Class 1 — names that never change

A thing someone else owns and spells. Shipped in every locale as-is:

`KiwiCV` · `KiwiCanopy` · `Google` · `Google Drive` · `Google OAuth` · `GitHub` ·
`Supabase` · `Discord` · `Word` · `DIN 5008`

A name inside a sentence is protected as **the whole string**, never as an
acronym inside it — `Vertex AI` is protected; the `AI` inside it is not (see
class 3).

⚠️ **A name is enforced only where a row protects it.** `protectedTokens` fires
on packet import and `i18n:check` also holds every shipped value
against its row's tokens — but a key with no row has no enforcement at all,
and `tests/i18n/handoff-catalog-coverage.test.cjs` only says whether an export
has any row. Measured 2026-10-06: `ja`, `ru`, `pl` and `zh` had localized it in
`sync` and `landing` (and `bg` as `Google Драйв`) because no row protected those
keys; they now carry `['Google Drive']`, or `['Drive']` where English says the
bare short form. A new key naming Google Drive needs its row in the same change.
Published `changelog` entries of past versions still carry the localized forms
in `ja` and `ru`; they are not catalogued.

⚠️ **`Google Drive` stays English even where Google localizes it** (owner,
2026-10-06). Google's own UI and consent screen say _Google ドライブ_, _Google
云端硬盘_, _Google Диск_, _Dysk Google_; KiwiCV still writes `Google Drive` in
all fifteen. Weighed and decided, so a pass that "aligns with Google's
spelling" is undoing a ruling, not fixing a defect.

## Class 2 — formats and identifiers

`PDF` · `HTML` · `TXT` · `.json` · keyboard shortcuts (`⌘/Ctrl+B`, `⌘/Ctrl+I`)

These read as words but are typed, clicked or looked for. A translated `PDF`
sends the user hunting for a control that does not exist.

## Class 3 — concepts that look like names

⚠️ **This is the class that has already shipped a defect, and the one to get
right.** `AI` is the canonical case: it reads like a product name and is not — it
is the concept, and the locales localize it.

|              |                                                                                                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| localized    | `de` **KI** · `fr` **IA** · `es` **IA** · `ru` **ИИ**                                                                                                               |
| kept as `AI` | `ja` · `zh` — measured 2026-09-07: 11 and 20 occurrences, **zero** uses of 人工知能 / 人工智能. Consistent, and consistent with how both locales write it elsewhere |

⚠️ **Never put a class-3 term in `protectedTokens`.** Sixteen catalog rows
protected the bare token `AI` until 2026-08-26. Because `handoff-validation.cjs`
enforces protected tokens, the packet then **required** the English acronym in
every locale; the next pass dutifully "fixed" twelve shipped German strings back
to `AI` and reverted the KI decision in one atomic apply, with `--check`
green the whole way. `tests/i18n/handoff-catalog.test.cjs` now fails on the bare
token — that guard is the scar, not the policy.

## Class 4 — ordinary product vocabulary

Translated, matching the register the locale already uses. `Export` →
`Exportieren` / `Exporter` / `Экспорт` / `エクスポート` / `导出`. Nothing to decide;
read the neighbouring keys and match them.

⚠️ **Derive from a sibling before composing.** The rule in
`.claude/rules/i18n.md` exists because a term is only consistent if the second
string reuses the first one's choice: `common.close_dialog` took its verb from
`common.close_menu`; `settings.github.show_token` took its noun from
`settings.github.personal_token`, so the button and the field it labels say one
word in every language. `ai.import_max_size` took each locale's own unit —
`Mo`, `МБ`.

## `token` / PAT — decided 2026-09-08

**Class 4. Ordinary vocabulary, translated per locale.** The shipped values
already said so: `fr` uses _jeton_ throughout, `zh` 令牌 throughout, and the
remaining twelve use _token_ / _токен_ / _トークン_ consistently. Nothing about a
bare _token_ is a name someone else spells; the full name `Personal Access Token` is the exception, below.

⚠️ **What class 4 requires is one word per locale, in every string of the block.**
`tr` shipped four for one credential inside one dialog — _Jeton_ on the field
label, _token_ in its own placeholder, _Token_ on the checkbox beneath, _belirteç_
in the error it raises, _Anahtar_ in the amber note beside it.

**Turkish is `Jeton`**, derived the way this page's class-4 rule says to: from
`settings.github.personal_token`, the label the user reads first, from which
`show_token`/`hide_token` had already taken their noun. _Anahtar_
("key") is wrong for a token regardless; _belirteç_ and the bare loanword are
both defensible Turkish but neither is what the field is called.

⚠️ **`ghp_` stays verbatim** — class 2, the literal prefix GitHub issues. So does
`PAT`, and `'Fine-grained'` and `'Contents'`, which reproduce GitHub's own UI
labels.

⚠️ **`Personal Access Token` stays English verbatim in all fifteen locales**
(owner, 2026-10-12). GitHub's UI is English-only, so the full name is the label the
user will find on github.com, exactly like `'Fine-grained'` and `'Contents'`. It
sits in `protectedTokens` on `settings.github.personal_token`, `pat_security_note`,
`extras.howto.github.step2_title`, `step2_desc` and `pat_security_tip`;
`sync.confirm_delete_github_message` has no catalog row, so nothing enforces it
there. The class-4 rule above now governs only the bare word _token_ (_Jeton_ in
`tr`, 令牌 in `zh`). Adjust article, gender and case around the English name rather
than declining it into the sentence. `legal.ts` is out of scope and keeps its
translated form. The `ghp_…` placeholders are identifiers and keep their own
spelling.

⚠️ **The rule is one word for the credential, not one word per file.** It appears
in `settings.github`, in `extras.howto.github` (the wizard that walks the user
into that dialog) and in `cvs.error_desc`. All three are aligned; a future string
anywhere else takes the same word.

⚠️ **Two human-authored Turkish values disagree, and the ruling picked one.**
`settings.github.personal_token` — _Kişisel Erişim Jetonu_ — was written by the
owner (2026-07-22), before agents authored locales, which is what
makes deriving from it non-circular. But `tr/legal.ts:83` says _Kişisel Erişim
**Belirteci**_ and is also hand-written. `Jeton` was chosen because it is the
label the user reads first and the noun `show_token`/`hide_token` already took
from it; `belirteç` is the TDK-derived term and is what Microsoft's
Turkish uses. Recorded so the disagreement is visible rather than rediscovered.

⚠️ **Only `legal.withdrawal.*` is out of scope for a terminology sweep.** It is
the prescribed statutory wording, hand-transcribed rather than translated. The
rest of `legal.ts` goes through the packet and follows the legal register and
AI-term rulings in `.claude/rules/i18n.md`.

⚠️ **The block was invisible to review until now.** Fourteen of the seventeen
`settings.github` keys, and all twelve `extras.howto.github` keys, had no
`handoff-catalog.cjs` row, so they were generated, synced and shipped without
ever entering a packet — which is why four Turkish words for one thing survived.
The words were never the failure; the missing rows were. Rows added for all
twenty-six.

## The three dismissal controls

Recorded 2026-09-07 after `i18n-auditor`'s first run, because these three ✕
buttons sit in one product and read alike in English. **They must not read alike
in any locale** — a screen-reader user is told which of three things is closing.

| locale | `close_dialog`              | `close_menu`     | `dismiss_notification`     |
| ------ | --------------------------- | ---------------- | -------------------------- |
| `de`   | Dialog schließen            | Menü schließen   | Benachrichtigung schließen |
| `fr`   | Fermer la boîte de dialogue | Fermer le menu   | Fermer la notification     |
| `es`   | Cerrar diálogo              | Cerrar menú      | Cerrar notificación        |
| `it`   | Chiudi finestra di dialogo  | Chiudi menu      | Chiudi notifica            |
| `pt`   | Fechar caixa de diálogo     | Fechar menu      | Fechar notificação         |
| `nl`   | Dialoogvenster sluiten      | Menu sluiten     | Melding sluiten            |
| `pl`   | Zamknij okno dialogowe      | Zamknij menu     | Zamknij powiadomienie      |
| `ru`   | Закрыть диалоговое окно     | Закрыть меню     | Закрыть уведомление        |
| `zh`   | 关闭对话框                  | 关闭菜单         | 关闭通知                   |
| `ja`   | ダイアログを閉じる          | メニューを閉じる | 通知を閉じる               |
| `bg`   | Затвори диалоговия прозорец | Затвори менюто   | Затвори известието         |
| `tr`   | İletişim kutusunu kapat     | Menüyü kapat     | Bildirimi kapat            |
| `sv`   | Stäng dialogruta            | Stäng meny       | Stäng avisering            |
| `uk`   | Закрити діалогове вікно     | Закрити меню     | Закрити сповіщення         |

⚠️ **The notification noun was coined, and this table is its only record.** No
product-UI string in any locale named a toast before 2026-09-07 — the auditor
grepped for it, and every other hit was legal boilerplate, changelog prose, or a
false friend (`tr` _Geri Bildirim_ = feedback, `nl` _vermelding_ = entry, `ja`
法的通知 = legal notice). Per this page's closing section that was a case to
escalate, and it shipped instead. Reuse these nouns for any future notification
string rather than coining a second set: four words for one thing in one panel is
exactly how `tr` ended up with four for a GitHub token.

⚠️ **Close, not Dismiss — deliberate, in all fourteen.** English splits _Close_ a
dialog from _Dismiss_ a notification; no locale does. A literal _dismiss_ (`de`
verwerfen, `fr` rejeter/ignorer, `ru` отклонить) reads as rejecting the message's
**content**, which on an error toast could suggest refusing the operation that
raised it. "Close the notification" is idiomatic everywhere. Recorded so the next
pass does not read the flattening as an oversight and "fix" it.

⚠️ **`bg` and `pt` were corrected here**, from bare _диалог_ / _diálogo_ to the
fuller noun each locale's own translator-authored changelog already uses for this
exact action. Where a locale's shipped prose names an object, that naming wins
over a shorter form that merely parses.

`sv` _avisering_ is the term with the thinnest evidence — _avisering_ and _notis_
are both live in Swedish software, and this key is the word's only occurrence in
the `sv` tree. Worth a native eye if one is ever available.

## `Pass` — decided 2026-09-08

⚠️ **Class 1. A product name, kept verbatim in all fifteen.** Owner ruling; this
section replaces the open question that stood here.

`code/DESIGN_LANGUAGE.md` names Stripe's terminology canonical for pricing, and
the ruling reads that as governing the word itself rather than only its English
spelling. `common.premium_pass` had shipped three ways — kept in `en` `de` `fr`
`it` `tr` `sv`, transliterated in `ru` Пасс · `bg`/`uk` Пас · `ja` パス · `nl`
Pas · `pt` Passe · `es` Pase, translated in `pl` Karnet · `zh` 通行证 — and all
fifteen now read `Pass`, with `protectedTokens: ['Pass']` on the catalog row so a
future packet cannot undo it.

⚠️ **The German and Dutch reading was weighed and accepted.** Bare `Pass` / `Pas`
reads first as _passport_ in those languages. That is the cost of a brand name
and is not a defect to fix.

⚠️ **No `untranslated-allowlist.cjs` entry is needed, and none should be added.**
The check ignores values under ten characters, so a four-letter name never
reaches it.

### ⚠️ The ruling is applied to the canonical key only, and 16 other strings owe it

Sixteen catalogued strings say `Pass` inside a sentence — pricing copy,
monetization descriptions. Measured 2026-09-08, eight locales do **not** carry it
inline: `bg` `es` `ja` `nl` `pl` `ru` `zh` each drop it in 11 of the 16, `uk` in 6. Roughly 90 cells.

Under class 1 those are now wrong. They were left out of the ruling's first pass
deliberately — rewriting pricing sentences in eight languages is its own change
with its own review, not a rider on a terminology decision. Protecting the bare
token on those rows before the cells are fixed would fail `--check` on all ninety
at once, which is the shape of the 2026-08-26 `AI` revert and the reason this
page warns about bare tokens at all.

## German `Template` — decided 2026-10-06

⚠️ **`de` says _Template_, never _Vorlage_, for any template the user picks or
applies** — a CV's visual template and, deliberately, the address-format presets
(`design.address_schema_apply_template`), so one word covers both. Class 4, with
German choosing the loanword. Owner ruling, overturning a change that had gone the other
way and derived _Vorlage_ from that address sibling. Applied to every product
string that said _Vorlage_ — `design.template`,
`design.address_schema_apply_template`, `landing.proof.templates.title`, and
`roadmap.items.matching_cover_letters` / `more_themes` — and each catalog row
carries the note, so a retranslation reads it. Compounds take a hyphen and
neuter gender: _Lebenslauf-Template_, _deinem gewählten Lebenslauf-Template_.

⚠️ **_Design_ is not covered.** `cvs.chip_theme`, `editor.coverLetter.theme` and
the landing copy say _Design_ because their English does. The CV library's
filter says _Template_ while its chip says _Design_ in English too, so aligning
them is an English copy decision first, not a German sweep.

⚠️ **Two places keep _Vorlage_ on purpose.** `seo.*` meta text says _Lebenslauf
Vorlagen_, by the same reasoning as the spine in `code/SEO.md`: the meta
title is built on the term people type. Changing it is an SEO call for the
owner, not a terminology sweep. Shipped `changelog/` entries are history and are
not rewritten.

## `Fair Use Policy` — decided 2026-10-12

Class 4: translated in every locale, never kept as the English name. ⚠️ **`sv` says
_Policy för skälig användning_** (owner, 2026-10-12): it was the only locale shipping the
English. The term names section 1 of the Terms (`legal.terms.sections.1.title`), so the
purchase dialog's `monetization.fair_use.link` and the sentence above it
(`fair_use.description`) use the same words; inside a sentence it is lower-case
(_vår policy för skälig användning_).

## When this page is silent

A new term with no class here and no sibling in the locale is the case that
**coins vocabulary**, and a coined term is far harder to retract than a blocked
review. Say the page is silent and ask. Do not choose, and do not let a
plausible-sounding value stand in for a decision — nothing downstream reads
meaning: `check-locales.cjs` reads structure, `check-scripts.cjs` reads the
writing system, and `untranslated.cjs` only notices a value identical in all
fourteen.
