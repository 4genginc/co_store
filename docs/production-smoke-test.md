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
| 1 | Home page loads (signed-out) | ⏳ verify | `/` should render featured products + hero |
| 2 | Products page loads (signed-out) | ⏳ verify | `/products`; search + grid/list toggle |
| 3 | Single product page (signed-out) | ⏳ verify | Image, price, "Sign in to add to cart" CTA |
| 4 | Sign in via Clerk | ✅ | Implicit — was needed for cart |
| 5 | Add to cart | ✅ | Verified |
| 6 | Place order | ✅ | Verified |
| 7 | Stripe test checkout | ✅ | Verified — payment succeeded |
| 8 | /orders shows the paid order | ⏳ verify | After payment redirect |
| 9 | /admin/sales shows the paid order | ✅ | Verified |
| 10 | Admin: create product + upload image | ⏳ verify | `/admin/products/create`; image hits Supabase Storage |
| 11 | Newly-uploaded image renders on /products | ⏳ verify | Confirms `next.config.ts` `remotePatterns` allows the prod Supabase host |

## Known follow-ups (not blockers for Phase 11)

- `components/navbar/CartButton.tsx` shows a hardcoded `numItemsInCart = 9` placeholder. Doesn't affect any flow but visually wrong.
- Abandoned unpaid orders (created when a user clicks "Place order" but doesn't complete Stripe checkout) are orphaned in the DB. They never appear in `/orders` or `/admin/sales` (filtered on `isPaid: true`), so it's invisible — but they accumulate.

## Issues found

_None as of this run._
