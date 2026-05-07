# Production Smoke Test — Next Store

- **Production URL**: https://my-store-fedp.vercel.app
- **Tested commit**: `e7f5b1d` (Phase 11.1)
- **Date**: 2026-05-07
- **Tester**: weijiexi

This document records the post-deploy smoke check for Phase 11.3. The critical-path flow (cart → checkout → Stripe → paid order in admin sales) passed end-to-end. The remaining items below are quick-verify spot-checks.

## Critical path — verified end-to-end ✅

The signed-in customer journey works:

1. Add product to cart from a single-product page
2. /cart shows item, totals (subtotal + tax + shipping = order total)
3. Place order → redirects to /checkout
4. Stripe embedded UI renders, test card payment succeeds
5. /api/confirm flips `isPaid=true`, deletes cart
6. /admin/sales lists the paid order

This proves: Clerk auth, Supabase Postgres, Supabase Storage image rendering, server actions, Prisma writes, Stripe Embedded Checkout, the `return_url` round-trip, and the admin authorization gate are all correct in prod.

## Spot-check checklist

| # | Flow | Status | Notes |
|---|------|--------|-------|
| 1 | Home page loads (signed-out) | ✅ | Implicit — entry point for the cart flow |
| 2 | Products page loads (signed-out) | ✅ | Implicit — required to reach the single-product page |
| 3 | Single product page (signed-out) | ✅ | Implicit — required to add to cart |
| 4 | Sign in via Clerk | ✅ | Required for cart |
| 5 | Add to cart | ✅ | Verified |
| 6 | Place order | ✅ | Verified |
| 7 | Stripe test checkout | ✅ | Verified — payment succeeded |
| 8 | /orders shows the paid order | ✅ | `/api/confirm` redirects here after payment |
| 9 | /admin/sales shows the paid order | ✅ | Verified |
| 10 | Admin: create product + upload image | ✅ | Verified after the env-var + lazy-init fixes below |
| 11 | Newly-uploaded image renders on /products | ✅ | Confirms `next.config.ts` `remotePatterns` allows the prod Supabase host |

## Issues found and fixed during this run

Two latent build-time landmines surfaced when the admin upload path was first exercised in prod:

1. **`SUPABASE_BUCKET` missing in Vercel env** — image upload failed at runtime because `utils/supabase.ts` was uploading to bucket `undefined`. Fixed by adding the var to Vercel (Production scope).

2. **Stripe and Supabase SDKs throwing at module load** — after fixing (1), the next Vercel build failed during "Collecting page data": `new Stripe("")` and `createClient(undefined, undefined)` both throw eagerly in their current SDK majors, and the build evaluates every route module. Fixed in commits `65b72e9` (Stripe lazy getter) and `2a471de` (Supabase lazy getter). See **L-011** in `docs/learning.md` for the rule of thumb — *any* strict-constructor SDK loaded at module top-level is a build-time landmine if the env var isn't surfaced in every build context.

## Known follow-ups (not blockers for Phase 11)

- `components/navbar/CartButton.tsx` shows a hardcoded `numItemsInCart = 9` placeholder. Doesn't affect any flow but visually wrong.
- Abandoned unpaid orders (created when a user clicks "Place order" but doesn't complete Stripe checkout) are orphaned in the DB. They never appear in `/orders` or `/admin/sales` (filtered on `isPaid: true`), so it's invisible — but they accumulate.
- Secrets leaked into a chat transcript during this phase (full `.env` selection in the IDE). Three keys flagged for rotation: Postgres DB password, Stripe secret key, Clerk secret key.
