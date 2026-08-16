# VocaloCart — EN/JA Internationalization Plan

Execution plan for a togglable English / 日本語 UI. Slots into [`2.5 Internationalization`](./VOCALOCART_TASKS.md#25-internationalization-japan-specific) of the task spec, whose currency/消費税 item is already complete (execution log step 9). Follows the same staged format as [the execution log](./vocalocart-execution-log.md) — implement, verify, record.

---

## Decisions to lock before Stage 1

### D1 — Locale transport: cookie, not URL prefix **(recommended: cookie)**

| | Cookie mode | Path prefix (`/ja/cart`) |
|---|---|---|
| File moves | None | All 20 pages → `src/app/[locale]/` |
| `<html lang>` correct, no flash | Yes | Yes |
| Separately indexable per locale | **No** | Yes |
| Shareable "this page in JA" link | **No** | Yes |

The task spec says the architecture should not be restructured. Moving every route into a `[locale]` segment is a routing restructure, even though no component code changes. Cookie mode avoids it entirely.

The honest counterpoint: path-prefix + `hreflang` is the textbook answer, and an interviewer may probe it. But this is a portfolio shop nobody is organically searching for, so the SEO benefit is theoretical while the refactor cost is real. **Being able to explain the tradeoff is a stronger talking point than having done it by rote.**

Mitigation: message files and the `useTranslations` call sites are *identical* under both modes. If path-prefix is ever wanted, it becomes a routing-only migration that touches `layout.tsx`, `proxy.ts`, and file locations — not the 20 pages' contents. Stages 4–8 below are not redone.

### D2 — Admin pages: English only **(recommended)**

`admin/products` (20 strings, the single largest file) and `admin/orders` are internal tooling. Excluding them removes roughly a quarter of the extraction work for zero customer-facing loss. Reversible later — the infrastructure will already be in place.

### D3 — Product content: out of scope for this pass

`Product.name`, `Product.description`, `Category.name` are single `String` columns. Translating UI chrome does not touch them. Deferred to Stage 11 as an explicit, separately-approved schema change.

### D4 — API error messages: English, this pass

Server-thrown strings (Zod messages, `{ error: '...' }` bodies) surface through `toast.error`. Translating them properly means returning stable error *codes* and mapping them client-side — a real refactor of every route. Out of scope; only client-side generic fallbacks get translated. Recorded so it's a known gap, not an oversight.

---

## Stages

Verification for every stage, matching existing convention: `tsc --noEmit`, `npm run lint`, `npm test`, `npm run build`.

### Stage 1 — Foundation (zero visible change)

Install `next-intl@^4.4` (the version line that supports Next 16).

- `messages/en.json`, `messages/ja.json` — scaffolds, one real key to prove the wiring
- `src/i18n/request.ts` — `getRequestConfig` reading a `locale` cookie, defaulting to `en`
- `next.config.ts` — wrap export in `createNextIntlPlugin()`, preserving the existing `turbopack.root` pin and `serverExternalPackages`
- `src/app/layout.tsx` — `<NextIntlClientProvider>` inside `<Providers>`; `<html lang={locale}>` now dynamic

Exit criterion: build passes, site looks byte-identical, one string demonstrably comes from `en.json`.

### Stage 2 — Japanese font

[layout.tsx:9](../vocalocart-nextjs/src/app/layout.tsx#L9) loads `Inter` with `subsets: ["latin"]`. It has no Japanese glyphs — JA text will silently fall back to a system font and look inconsistent with the design brief.

Add `Noto_Sans_JP` via `next/font/google` and compose both into the body font stack so Latin keeps rendering as Inter. Verify the exact `subsets`/`weight` args against the loader at implementation time rather than assuming.

Exit criterion: a JA string renders in Noto, confirmed in devtools' computed font — not merely "it looks fine."

### Stage 3 — The toggle

`src/components/LocaleSwitcher.tsx` — segmented two-button control, both languages always visible, active one highlighted:

- Labels in their own script: `English` / `日本語`. No flags, no `EN`/`JP`.
- Each button gets `lang="en"` / `lang="ja"` so screen readers pronounce them correctly
- `role="group"` + `aria-label`, `aria-pressed` on each button
- Writes the `locale` cookie via a server action, then `router.refresh()` to re-render with new messages

Mounted in [Navbar.tsx](../vocalocart-nextjs/src/components/Navbar.tsx) — both the desktop bar and the mobile menu.

Exit criterion: clicking 日本語 flips a real string and survives a reload.

### Stage 4 — Shared chrome

`Navbar`, `Footer`, `EmptyState`, `PageHeader`, `ProductCard`, `QuantityStepper`.

Includes a real refactor: [order-status.ts:15-23](../vocalocart-nextjs/src/lib/order-status.ts#L15-L23) hardcodes English `label` next to each icon. The icon map stays; `label` becomes a translation key. Touches `OrderStatusBadge`, `orders/page.tsx`, `admin/orders/page.tsx`.

### Stage 5 — Customer pages, batch 1 (highest traffic)

`page.tsx` (home), `product/[id]/page.tsx`, `cart`, `checkout`, `checkout/complete`.

Also localize metadata: root `metadata` in `layout.tsx`, and `generateMetadata` in [product/[id]/layout.tsx](../vocalocart-nextjs/src/app/product/[id]/layout.tsx) (already a Server Component, so this is clean).

### Stage 6 — Customer pages, batch 2

`login`, `register`, `orders`, `wishlist`, `my`, `addresses`, `contact`.

### Stage 7 — Formatting correctness

- [PriceTag.tsx:27](../vocalocart-nextjs/src/components/PriceTag.tsx#L27) calls `value.toLocaleString()` with **no locale argument**. That resolves from the ambient locale, which differs server vs. browser — a live hydration-mismatch risk independent of this feature. Pin it explicitly via next-intl's formatter.
- Order dates in `orders/page.tsx` — same treatment.
- Decide the EN rendering of the `消費税 (10%)` line (likely `Consumption tax (10%)`).

### Stage 8 — Layout under Japanese text

Japanese has no spaces, so it does not wrap at word boundaries — long strings overflow buttons and badges instead of wrapping. Sweep the fixed-width elements (nav items, buttons, `Badge`, `OrderStatusBadge`) with JA strings in place and apply `overflow-wrap` / `line-break` where needed. Commonly skipped; produces the most visible breakage when skipped.

### Stage 9 — `middleware.ts` → `proxy.ts`

Next.js renamed this file convention in v16; `middleware.ts` is deprecated with an official codemod. **You are on 16.1.6 (lockfile-pinned), where it still runs — nothing is broken right now.** But `package.json` specifies `^16.1.6`, so a routine bump into later 16.x moves you onto the deprecated path. Reports conflict on whether it merely warns or stops being picked up; worth not finding out on a deploy.

Since this stage touches the file anyway for optional `Accept-Language` first-visit detection, migrate it here:

```bash
npx @next/codemod@canary middleware-to-proxy .
```

One genuine consideration: **proxy runs on the Node runtime, not Edge, and that is not configurable.** [rate-limit.ts](../vocalocart-nextjs/src/lib/rate-limit.ts) is in-memory per warm instance — a documented tradeoff in that file's comments — so the instance model shifts slightly. Re-read that comment against the new runtime rather than assuming it still reads true.

### Stage 10 — Tests

- **Key-parity test**: assert `en.json` and `ja.json` have identical key sets, recursively. Cheap, and the single highest-value test here — it makes a forgotten translation fail CI instead of silently rendering a raw key in production.
- Locale cookie round-trip through `getRequestConfig`.

`ci.yml` already runs `npm test`, so no workflow change needed.

### Stage 11 — Product content (deferred, needs explicit go-ahead)

Per the task spec's own rule that schema changes get reported before proceeding: add nullable `nameJa` / `descriptionJa` to `Product` (and `Category.nameJa`) with fallback-to-English at render. Chosen over a `ProductTranslation` join table because two locales don't justify the query complexity, and it stays reversible.

---

## Explicitly not in this plan

The other open `2.5` item — **Japan-appropriate address forms** (prefecture dropdown, 〒 postal-code lookup, name-order handling) — is adjacent and valuable, but it is a data-model and form-validation task, not a translation task. Tracked separately so it doesn't inflate this one.

## Risks

| Risk | Severity | Handling |
|---|---|---|
| Hydration mismatch from unpinned `toLocaleString` | Medium — exists today | Stage 7 |
| JA text overflowing fixed-width UI | Medium | Stage 8 |
| Silent missing translations reaching prod | High | Stage 10 key-parity test |
| `middleware.ts` deprecation on a version bump | Low now, rises with upgrades | Stage 9 |
| `next-intl` + `use cache` interop | None today (unused) | Note it before adopting `use cache` |

## Sizing

~134 machine-detectable strings across 17 customer-facing files; realistically **250–350** once multi-line JSX text, prop-passed labels, and toast messages are counted. Stages 1–3 are the short part; 4–6 are the grind.
