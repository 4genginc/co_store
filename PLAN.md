# Next Store Agentic Build Plan

## Purpose
This document converts the rough Next Store manual into a phased, agent-executable build plan suitable for:

- PLAN.md
- Beads
- Claude Code CLI
- Codex CLI
- Gastown-style execution

The goal is not to copy the manual line-by-line. The goal is to convert it into a controlled build sequence with clear phases, task boundaries, acceptance criteria, and verification gates.

---

# Core Strategy

```text
Human draft manual
  ↓
Phased PLAN.md
  ↓
Epic + child beads
  ↓
One agent session per bead
  ↓
Verification before close
```

Key principle:

```text
Plan globally, execute locally.
```

---

# Product Goal

Build a production-style ecommerce store using:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma
- Supabase Postgres
- Supabase Storage
- Clerk authentication
- Stripe embedded checkout
- Vercel deployment

The application includes:

- Public storefront
- Product browsing
- Product search
- Single product pages
- User authentication
- Favorites
- Cart
- Orders
- Reviews
- Admin dashboard
- Product CRUD
- Image upload
- Sales/admin order view
- Stripe checkout

---

# Sources & Deviations

This plan was distilled from a written Next Store manual (the Coding Addict / Smilga-style tutorial). When the manual conflicts with the current versions of the underlying tools, or when we want to substitute our own data, we deviate — and record the deviation here and in `docs/learning.md`.

**Rules of thumb:**

- The plan describes *intent and acceptance gates*, not exact tool versions or fixture content.
- Any deviation from the manual that affects future phases (version pin, env-var rename, image-host change, schema variation) gets a `docs/learning.md` entry.
- Seed/fixture content (product catalog, hero images, copy) is treated as substitutable. Use the manual's data, your own catalog, or anything else that satisfies the bead's acceptance criterion. Note the choice in the relevant phase if it affects later phases (e.g. image hosts → `next.config.ts` `remotePatterns`).
- Tracked deviations live in `docs/learning.md`. Open active deviations as of last edit:
  - **L-002** — Prisma 7 with driver adapter (PrismaPg). Connection URLs now live in `prisma.config.ts` (migrations) + the `PrismaPg` adapter (runtime). See Phase 2.1.
  - **L-001** — *superseded by L-002.* Initial decision was to pin Prisma 6; we revisited that before Phase 3.

---

# Phase 0 — Project Foundation

## Objective
Create a clean Next.js application foundation with predictable structure.

## Scope
- Create Next.js app
- Remove boilerplate
- Set metadata
- Establish folder structure
- Confirm shadcn/ui baseline
- Add basic pages

## Tasks / Beads

### 0.1 Create and clean Next app

```bash
bd create \
  --title="Initialize clean Next Store app" \
  --description="Create a Next.js store app using the manual baseline. Remove boilerplate from globals.css and app/page.tsx. Set metadata title to Next Store and description to a concise ecommerce description. Do not add database, auth, or product logic yet." \
  --acceptance="npm run dev starts; home page renders simple HomePage text; app builds without TypeScript errors."
```

### 0.2 Create base routes

```bash
bd create \
  --title="Create base route pages" \
  --description="Create simple placeholder App Router pages for about, admin, cart, favorites, orders, products, and reviews. Each page should render a clear page title only. Do not implement business logic yet." \
  --acceptance="All routes load without 404; npm run build or npx tsc --noEmit passes."
```

### 0.3 Establish component folders

```bash
bd create \
  --title="Create component folder structure" \
  --description="Create the project component folder structure: components/ui, cart, form, global, home, navbar, products, single-product. Do not implement full components yet unless required for empty exports." \
  --acceptance="Folder structure exists and does not break imports or build."
```

## Phase 0 Verification

```bash
npm run dev
npx tsc --noEmit
```

---

# Phase 1 — Public Layout, Navbar, and Theme

## Objective
Create the public shell: layout, container, navbar, search input placeholder, cart icon placeholder, dark mode, and navigation dropdown.

## Scope
- Global Container component
- Navbar composition
- Logo
- NavSearch placeholder
- CartButton placeholder
- LinksDropdown
- Dark mode provider
- next-themes integration
- react-icons integration

## Tasks / Beads

### 1.1 Build global Container and root layout shell

```bash
bd create \
  --title="Build root layout shell" \
  --description="Implement components/global/Container.tsx using cn from lib/utils. Wire Navbar and Container into app/layout.tsx. Keep content centered with max width and padding. Do not implement auth, cart, or database behavior." \
  --acceptance="All pages render inside shared Navbar and Container; npx tsc --noEmit passes."
```

### 1.2 Build static Navbar components

```bash
bd create \
  --title="Build static Navbar components" \
  --description="Implement navbar components: Navbar, Logo, NavSearch, CartButton, LinksDropdown. Use shadcn Button/Input/DropdownMenu and react-icons. CartButton may use a temporary hard-coded cart count. Links should come from utils/links.ts." \
  --acceptance="Navbar renders logo, search input, cart button, theme button placeholder if present, and links dropdown; navigation links work."
```

### 1.3 Add dark mode provider and toggle

```bash
bd create \
  --title="Add dark mode support" \
  --description="Install and configure next-themes. Create app/providers.tsx and app/theme-provider.tsx. Implement navbar/DarkMode.tsx with shadcn dropdown and light/dark/system options. Do not alter business logic." \
  --acceptance="User can switch light, dark, and system themes; no hydration warnings; npx tsc --noEmit passes."
```

## Phase 1 Verification

```bash
npm run dev
npx tsc --noEmit
```

Manual checks:

- Home, About, Products routes render
- Navbar appears on all pages
- Dark mode toggle works

---

# Phase 2 — Database Foundation: Prisma + Supabase Postgres

## Objective
Establish database access and product data foundation.

## Scope
- Prisma install/init
- Supabase Postgres connection
- db singleton
- Product model
- seed data
- basic Prisma query practice route/page

## Tasks / Beads

### 2.1 Configure Prisma and database singleton

```bash
bd create \
  --title="Configure Prisma database foundation" \
  --description="Install prisma and @prisma/client. Run prisma init. Configure datasource for Supabase Postgres using DATABASE_URL and DIRECT_URL. Add utils/db.ts Prisma singleton suitable for Next.js development hot reload. Do not create product UI yet." \
  --acceptance="Prisma client generates successfully; utils/db.ts exports singleton client; npx tsc --noEmit passes."
```

> **Version note (current).** Use Prisma 7 with the driver-adapter pattern: `prisma@^7`, `@prisma/client@^7`, `@prisma/adapter-pg`, `pg`, plus `dotenv` (dev) for `.env` loading in non-Next.js contexts. The `schema.prisma` `datasource` block keeps only `provider`; connection URLs live in `prisma.config.ts` (`DIRECT_URL`, used by `prisma generate` / `prisma db push` / migrations) and in `utils/db.ts` (`DATABASE_URL`, passed to `PrismaPg` for runtime queries). See `docs/learning.md` entry **L-002** for the rationale and exact file layout. (L-001 captured the earlier v6 decision and is superseded.)

### 2.2 Add Product model

```bash
bd create \
  --title="Add Product database model" \
  --description="Add Product model with id, name, company, description, featured, image, price, createdAt, updatedAt, and clerkId fields. Apply schema using db push or migration according to project decision. Do not add auth enforcement yet." \
  --acceptance="Product model exists in Prisma schema; database schema is synced; Prisma Studio can show Product table."
```

> **Schema extension.** This project also carries `priceNote String?` on `Product` to support catalogs where every SKU has an indicative-pricing footnote (e.g., "evaluation pricing — volume terms via RFQ"). Treat the field as optional in form/UI scaffolding; if your seed catalog doesn't use it, leave it null.

### 2.3 Seed initial products

```bash
bd create \
  --title="Seed initial product data" \
  --description="Create prisma/products.json and prisma/seed.js based on the manual. Seed several products with name, company, description, featured, image, price, and clerkId. Do not build product UI yet." \
  --acceptance="node prisma/seed creates products; Prisma Studio shows seeded products; no duplicate seed failure on a clean database."
```

> **Seed source (current).** `prisma/products.json` ships with the **MicroEmbedded SDR catalog** — 5 products (L-SDR-U2, L-SDR-U1, RF900, URAN-1, L-SDR-N210) with indicative cent-based pricing and a `priceNote` per item. Images are hosted at `rfpga.s3.us-west-1.amazonaws.com` (already wired into `next.config.ts` `remotePatterns`). The seed clears the `Product` table before inserting, so it's safely re-runnable. The catalog is still substitutable — if you swap it, update `next.config.ts` for the new image host(s) and record any structural deviation in `docs/learning.md`.

## Phase 2 Verification

```bash
npx prisma generate
npx prisma db push
node prisma/seed
npx tsc --noEmit
```

Manual checks:

- Prisma Studio opens
- Products exist in DB

---

# Phase 3 — Public Product Browsing

## Objective
Build the public storefront experience for browsing products.

## Scope
- Home hero
- Featured products
- Product grid/list
- Product cards
- Currency formatting
- Remote image configuration
- Products page layout toggle
- Search handling
- Single product page

## Tasks / Beads

### 3.1 Add global display components

```bash
bd create \
  --title="Add global display components" \
  --description="Implement EmptyList, SectionTitle, and LoadingContainer components using shadcn UI where appropriate. These components support product browsing pages. Do not implement product fetching yet." \
  --acceptance="Components compile and can be imported without errors; npx tsc --noEmit passes."
```

### 3.2 Add product fetch actions and formatting helpers

```bash
bd create \
  --title="Add public product fetch helpers" \
  --description="Create utils/actions.ts with fetchFeaturedProducts, fetchAllProducts, and fetchSingleProduct. Add utils/format.ts with formatCurrency. Use Prisma Product model. Redirect to /products if a single product is missing." \
  --acceptance="Featured, all, and single product fetch helpers compile; npx tsc --noEmit passes."
```

### 3.3 Build product grid and list views

```bash
bd create \
  --title="Build product grid and list views" \
  --description="Implement ProductsGrid, ProductsList, FavoriteToggleButton placeholder, and ProductsContainer. Support grid/list selection via layout search param. Use Next Image and formatCurrency. Configure next.config remotePatterns for external product images." \
  --acceptance="/products renders products in grid and list modes; product cards link to /products/[id]; npx tsc --noEmit passes."
```

> **`remotePatterns` follows the seed.** Whatever image host(s) the seed uses must be in `next.config.ts` `images.remotePatterns`, or `next/image` will refuse to render them. Currently configured: `rfpga.s3.us-west-1.amazonaws.com` (MicroEmbedded SDR catalog). Phase 6.3 will additionally add the Supabase Storage hostname for admin-uploaded images.

### 3.4 Build home page hero and featured products

```bash
bd create \
  --title="Build home hero and featured products" \
  --description="Implement Hero, HeroCarousel, and FeaturedProducts. Home page should render hero content plus featured products inside Suspense with LoadingContainer fallback. Use static hero images from public/images or placeholders as needed." \
  --acceptance="Home page renders hero and featured products; Suspense fallback is valid; npx tsc --noEmit passes."
```

### 3.5 Add product search behavior

```bash
bd create \
  --title="Add product search" \
  --description="Refactor NavSearch as a client component using useSearchParams, useRouter, and use-debounce. Update fetchAllProducts to filter by product name or company using case-insensitive contains. Wrap NavSearch in Suspense to avoid CSR bailout error." \
  --acceptance="Typing search in navbar routes to /products with search param; product list filters correctly; no missing Suspense error; npx tsc --noEmit passes."
```

### 3.6 Build single product page

```bash
bd create \
  --title="Build single product page" \
  --description="Create app/products/[id]/page.tsx and components/single-product: BreadCrumbs, ProductRating placeholder, AddToCart placeholder. Render product image, name, company, price, description, favorite button placeholder, rating placeholder, and add-to-cart button placeholder." \
  --acceptance="Clicking product card opens detail page; missing product redirects to /products; npx tsc --noEmit passes."
```

## Phase 3 Verification

```bash
npm run dev
npx tsc --noEmit
```

Manual checks:

- Home page renders hero + featured products
- Products page supports grid/list
- Search filters products
- Single product page opens correctly

---

# Phase 4 — Authentication and Protected Routes

## Objective
Add Clerk authentication and protect private routes.

## Scope
- Clerk provider
- Middleware
- Login/register modal links
- User icon/avatar
- Sign out link
- Admin user environment variable
- Protected private routes

## Tasks / Beads

### 4.1 Install and configure Clerk

```bash
bd create \
  --title="Configure Clerk authentication" \
  --description="Install @clerk/nextjs. Add ClerkProvider around the app. Configure NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in env files. Do not implement admin rules yet." \
  --acceptance="App starts with ClerkProvider; signed-out public pages still render; npx tsc --noEmit passes."
```

### 4.2 Add auth middleware

```bash
bd create \
  --title="Protect private routes with Clerk middleware" \
  --description="Create middleware.ts using clerkMiddleware and createRouteMatcher. Public routes should include /, /products(.*), and /about. Protect private routes such as cart, favorites, orders, reviews, and admin. Do not add admin-only logic yet." \
  --acceptance="Public routes are accessible signed out; private routes require sign-in; npx tsc --noEmit passes."
```

### 4.3 Complete authenticated navbar menu

```bash
bd create \
  --title="Complete authenticated navbar menu" \
  --description="Update LinksDropdown to show Login/Register for SignedOut and navigation links plus SignOutLink for SignedIn. Add UserIcon using currentUser avatar when available. Use Clerk SignInButton, SignUpButton, SignedIn, and SignedOut." \
  --acceptance="Signed-out users see Login/Register; signed-in users see avatar, links, and logout; logout shows toast; npx tsc --noEmit passes."
```

## Phase 4 Verification

```bash
npm run dev
npx tsc --noEmit
```

Manual checks:

- Sign up
- Sign in
- Sign out
- Protected route redirects/protects correctly

---

# Phase 5 — Admin Foundation

## Objective
Create admin dashboard structure and admin-only access control.

## Scope
- Admin links
- Admin sidebar
- Admin layout
- Admin-only middleware
- Dashboard visibility only for admin

## Tasks / Beads

### 5.1 Create admin navigation and layout

```bash
bd create \
  --title="Create admin dashboard layout" \
  --description="Add adminLinks to utils/links.ts. Create app/admin/layout.tsx and app/admin/Sidebar.tsx with active route styling. Create placeholder admin sales, products, and product create pages. Do not implement CRUD yet." \
  --acceptance="Admin layout renders sidebar and child pages; active link style works; npx tsc --noEmit passes."
```

### 5.2 Restrict admin access

```bash
bd create \
  --title="Restrict admin access" \
  --description="Update middleware to detect /admin routes and compare Clerk userId with ADMIN_USER_ID env variable. Redirect non-admin users to /. Hide dashboard link in LinksDropdown for non-admin users." \
  --acceptance="Admin user can access /admin; non-admin signed-in users are redirected; dashboard link appears only for admin; npx tsc --noEmit passes."
```

## Phase 5 Verification

```bash
npm run dev
npx tsc --noEmit
```

Manual checks:

- Admin account sees dashboard link
- Non-admin account does not
- Non-admin cannot access /admin directly

---

# Phase 6 — Admin Product Creation and Image Upload

## Objective
Allow admin users to create products with validated form input and uploaded images.

## Scope
- Reusable form components
- FormContainer with server actions
- Submit button with pending state
- Zod schemas
- Supabase Storage image upload
- createProductAction

## Tasks / Beads

### 6.1 Build reusable form components

```bash
bd create \
  --title="Build reusable form components" \
  --description="Create components/form: FormInput, PriceInput, ImageInput, TextAreaInput, CheckBoxInput, Buttons, and FormContainer. Use shadcn Label/Input/Textarea/Checkbox/Button and useFormStatus/useFormState. Do not implement product creation logic yet." \
  --acceptance="Create product page can import and render all form components; npx tsc --noEmit passes."
```

### 6.2 Add product validation schemas

```bash
bd create \
  --title="Add Zod validation schemas" \
  --description="Install zod. Create utils/schemas.ts with productSchema, imageSchema, validateImageFile, and validateWithZodSchema. Validation should provide user-friendly messages for name, price, description, and image file constraints." \
  --acceptance="Schemas compile; invalid form data returns readable errors through validateWithZodSchema; npx tsc --noEmit passes."
```

### 6.3 Configure Supabase Storage upload helper

```bash
bd create \
  --title="Configure Supabase image upload" \
  --description="Install @supabase/supabase-js. Create utils/supabase.ts with Supabase client, bucket name, uploadImage, and deleteImage helpers. Add Supabase storage hostname to Next image remotePatterns. Do not implement product CRUD yet." \
  --acceptance="uploadImage returns public URL for valid image; deleteImage removes object by public URL filename; npx tsc --noEmit passes."
```

> **Supabase API key naming.** Newer Supabase projects (created mid-2025+) issue **publishable** keys named `sb_publishable_…` and ship them via `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, replacing the legacy `anon` key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`). The `@supabase/supabase-js` `createClient` call accepts either, so use whichever name your `.env` actually has. If both forms are documented in the manual you're following, prefer the publishable name on new projects and record the choice in `docs/learning.md` if it surfaces in shared code.

### 6.4 Implement create product action and page

```bash
bd create \
  --title="Implement admin create product" \
  --description="Implement createProductAction using getAuthUser/getAdminUser, productSchema, imageSchema, uploadImage, and Prisma Product create. Complete app/admin/products/create/page.tsx with reusable form components. Redirect to /admin/products after successful create." \
  --acceptance="Admin can create a product with uploaded image; product appears in DB and public product list; validation errors show toast; npx tsc --noEmit passes."
```

## Phase 6 Verification

```bash
npm run dev
npx tsc --noEmit
```

Manual checks:

- Admin creates product
- Image uploads to Supabase Storage
- Product appears on products page
- Invalid form shows useful error

---

# Phase 7 — Admin Product Management

## Objective
Allow admin users to view, edit, and delete products.

## Scope
- Admin product table
- fetchAdminProducts
- Delete action
- Supabase image cleanup
- Edit product page
- Update product action
- Update product image action

## Tasks / Beads

### 7.1 Build admin product list

```bash
bd create \
  --title="Build admin product list" \
  --description="Implement fetchAdminProducts and app/admin/products/page.tsx. Render shadcn Table with product name, company, price, and actions. Include edit and delete button placeholders. Require admin access via getAdminUser." \
  --acceptance="Admin products page lists all products; non-admin cannot access; npx tsc --noEmit passes."
```

### 7.2 Implement delete product

```bash
bd create \
  --title="Implement delete product" \
  --description="Implement deleteProductAction. Delete product from database, remove image from Supabase Storage, revalidate /admin/products, and return toast message. Wire DeleteProduct form into admin products table." \
  --acceptance="Admin can delete product; DB row is removed; image is removed from storage; table refreshes; npx tsc --noEmit passes."
```

### 7.3 Implement edit product details

```bash
bd create \
  --title="Implement edit product details" \
  --description="Implement fetchAdminProductDetails and updateProductAction. Create app/admin/products/[id]/edit/page.tsx. Reuse product form fields with default values. Do not handle image replacement in this bead." \
  --acceptance="Admin can edit name, company, price, description, and featured status; changes persist; npx tsc --noEmit passes."
```

### 7.4 Implement update product image

```bash
bd create \
  --title="Implement update product image" \
  --description="Implement updateProductImageAction. Validate uploaded image, upload new image to Supabase Storage, update Product.image, delete old image if appropriate, and revalidate product/admin pages." \
  --acceptance="Admin can replace product image; new image appears publicly; old image cleanup works; npx tsc --noEmit passes."
```

## Phase 7 Verification

```bash
npm run dev
npx tsc --noEmit
```

Manual checks:

- Admin list works
- Create/edit/delete works
- Image replacement works
- Public product pages reflect changes

---

# Phase 8 — Favorites and Reviews

## Objective
Add user-specific product engagement features.

## Scope
- Favorite model
- Favorite toggle action
- Favorites page
- Review model
- Review create/delete
- Product rating aggregation
- Reviews page/list

## Tasks / Beads

### 8.1 Implement favorites model and actions

```bash
bd create \
  --title="Implement favorites data model and actions" \
  --description="Add Favorite model linking clerkId and productId. Implement fetchFavoriteId, toggleFavoriteAction, and fetchUserFavorites. Update FavoriteToggleButton/Form to require signed-in user and toggle state." \
  --acceptance="Signed-in user can favorite/unfavorite products; signed-out user is prompted to sign in; favorites are user-specific; npx tsc --noEmit passes."
```

### 8.2 Build favorites page

```bash
bd create \
  --title="Build favorites page" \
  --description="Implement /favorites page using fetchUserFavorites and ProductsGrid or equivalent display. Empty state should render EmptyList. Route remains protected." \
  --acceptance="Signed-in user sees only their favorites; empty favorites shows empty state; npx tsc --noEmit passes."
```

### 8.3 Implement reviews model and actions

```bash
bd create \
  --title="Implement reviews data model and actions" \
  --description="Add Review model linked to product and clerkId. Implement createReviewAction, deleteReviewAction, fetchProductReviews, fetchProductRating, and fetchUserReviews where appropriate. Prevent duplicate reviews per user/product if desired by schema." \
  --acceptance="Signed-in user can create and delete own reviews; product rating/count can be fetched; npx tsc --noEmit passes."
```

### 8.4 Build reviews UI

```bash
bd create \
  --title="Build reviews UI" \
  --description="Add review form/list components and wire them into single product page and /reviews page. ProductRating should use real rating/count instead of placeholder values." \
  --acceptance="Single product page shows reviews and rating; user reviews page lists own reviews; create/delete review flow works; npx tsc --noEmit passes."
```

## Phase 8 Verification

```bash
npm run dev
npx tsc --noEmit
```

Manual checks:

- Favorite/unfavorite product
- Favorites page updates
- Create/delete review
- Product rating updates

---

# Phase 9 — Cart and Orders

## Objective
Implement cart behavior, order creation, and user/admin order pages.

## Scope
- Cart and CartItem models
- Add to cart
- Cart totals calculation
- Cart page
- Cart item amount update/removal
- Order model
- Create order
- User orders page
- Admin sales page

## Tasks / Beads

### 9.1 Add cart models and cart helpers

```bash
bd create \
  --title="Add cart models and helpers" \
  --description="Add Cart and CartItem models. Implement fetchProduct, fetchOrCreateCart, updateOrCreateCartItem, and updateCart. Cart should track numItemsInCart, cartTotal, tax, shipping, and orderTotal." \
  --acceptance="Cart helpers create and update user cart correctly; totals are calculated from cart items and product prices; npx tsc --noEmit passes."
```

### 9.2 Implement add to cart flow

```bash
bd create \
  --title="Implement add to cart flow" \
  --description="Update AddToCart component and addToCartAction. Signed-in user can add product with amount to cart. Action validates product existence, creates cart if missing, updates item quantity, updates cart totals, and redirects to /cart." \
  --acceptance="Adding product from product page redirects to cart; repeated add increases quantity; npx tsc --noEmit passes."
```

### 9.3 Build cart page and item controls

```bash
bd create \
  --title="Build cart page" \
  --description="Create components/cart: CartItemColumns, CartItemsList, CartTotals, ThirdColumn, and any amount controls. Implement /cart page. Support empty cart state, item display, amount updates, remove item, and totals display." \
  --acceptance="Cart page shows items and totals; user can update amount and remove items; empty cart state works; npx tsc --noEmit passes."
```

### 9.4 Add order model and order actions

```bash
bd create \
  --title="Add order model and actions" \
  --description="Add Order model with clerkId, products count, orderTotal, tax, shipping, email, isPaid, createdAt, and updatedAt. Implement createOrderAction, fetchUserOrders, and fetchAdminOrders. Initial non-Stripe flow may create paid orders and clear cart." \
  --acceptance="User can create order from cart; cart clears after order; user orders page data can be fetched; admin orders data can be fetched; npx tsc --noEmit passes."
```

### 9.5 Build user orders and admin sales pages

```bash
bd create \
  --title="Build orders and admin sales pages" \
  --description="Implement /orders page and /admin/sales page using shadcn Table. Add formatDate helper. Add loading table states if needed. User page shows only user orders; admin sales page shows paid orders." \
  --acceptance="User can view own orders; admin can view sales/orders; totals and dates format correctly; npx tsc --noEmit passes."
```

## Phase 9 Verification

```bash
npm run dev
npx tsc --noEmit
```

Manual checks:

- Add product to cart
- Change quantity
- Remove item
- Create order
- Cart clears
- User sees order
- Admin sees sales/order data

---

# Phase 10 — Stripe Embedded Checkout

## Objective
Replace or extend simple order creation with Stripe payment flow.

## Scope
- Stripe SDKs
- Checkout page
- Payment API route
- Confirm API route
- Order marked paid after successful checkout
- Cart deleted after payment

## Tasks / Beads

### 10.1 Configure Stripe client and checkout page

```bash
bd create \
  --title="Configure Stripe embedded checkout page" \
  --description="Install stripe, @stripe/stripe-js, @stripe/react-stripe-js, and axios if needed. Create checkout page using EmbeddedCheckoutProvider and EmbeddedCheckout. Read orderId and cartId from search params. Do not implement payment API yet." \
  --acceptance="Checkout page renders embedded checkout container and compiles; env var NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is documented; npx tsc --noEmit passes."
```

### 10.2 Implement payment API route

```bash
bd create \
  --title="Implement Stripe payment API route" \
  --description="Create app/api/payment/route.ts. Validate orderId and cartId from POST body. Load order and cart with cartItems and product. Create Stripe checkout session with embedded ui_mode, line_items from cart items, metadata orderId/cartId, and return_url to /api/confirm." \
  --acceptance="POST /api/payment returns clientSecret for valid order/cart; returns 404 for missing order/cart; logs server errors; npx tsc --noEmit passes."
```

### 10.3 Implement payment confirmation route

```bash
bd create \
  --title="Implement Stripe confirm route" \
  --description="Create app/api/confirm/route.ts. Retrieve Stripe session by session_id. If complete, update order isPaid=true and delete cart by cartId from metadata. Redirect to /orders. Log errors clearly." \
  --acceptance="Successful Stripe return marks order paid, deletes cart, and redirects to /orders; failures return clear server error; npx tsc --noEmit passes."
```

### 10.4 Wire cart checkout to Stripe

```bash
bd create \
  --title="Wire cart checkout to Stripe flow" \
  --description="Update cart totals/checkout action so checkout creates an unpaid order with current cart totals and redirects to /checkout?orderId=...&cartId=.... Ensure fetchUserOrders and fetchAdminOrders show only paid orders." \
  --acceptance="Cart checkout opens Stripe embedded checkout; successful payment creates paid order and clears cart; unpaid orders do not appear in orders list; npx tsc --noEmit passes."
```

## Phase 10 Verification

```bash
npm run dev
npx tsc --noEmit
```

Manual checks:

- Checkout page loads
- Stripe test payment succeeds
- Confirm route updates order
- Cart is deleted
- Orders page shows paid order

---

# Phase 11 — Deployment and Production Hardening

## Objective
Prepare the app for Vercel deployment and production behavior.

## Scope
- GitHub repository
- Vercel deployment
- Env variables
- Build script
- Prisma generate
- Remote image configuration
- Production smoke test

## Tasks / Beads

### 11.1 Prepare production build configuration

```bash
bd create \
  --title="Prepare production build configuration" \
  --description="Update package.json build script to run prisma generate before next build. Confirm .env files are gitignored. Document required env variables for Clerk, Supabase, Prisma, Stripe, and ADMIN_USER_ID. Do not deploy yet." \
  --acceptance="npm run build succeeds locally with required env vars; .env files are ignored; npx tsc --noEmit passes."
```

### 11.2 Deploy to Vercel

```bash
bd create \
  --title="Deploy Next Store to Vercel" \
  --description="Create GitHub repository, push code, connect to Vercel, configure env variables, and deploy. Resolve build issues without changing product scope." \
  --acceptance="Vercel deployment succeeds; production URL loads home/products pages; auth, image rendering, and database access work."
```

### 11.3 Production smoke test

```bash
bd create \
  --title="Run production smoke test" \
  --description="Smoke test deployed app: public pages, auth sign-in, product browsing, admin access, create product, upload image, add to cart, checkout test flow, orders page. Record findings in docs/production-smoke-test.md." \
  --acceptance="Smoke test document exists; critical flows pass or issues are clearly listed; no bead is closed if critical production flow fails."
```

## Phase 11 Verification

```bash
npm run build
```

Production checks:

- Home page
- Products page
- Single product page
- Clerk login
- Admin product create
- Supabase image display
- Stripe test checkout
- Orders page

---

# Recommended Dependency Graph

```text
Phase 0 foundation
  ↓
Phase 1 layout/navbar/theme
  ↓
Phase 2 database/product model
  ↓
Phase 3 public product browsing
  ↓
Phase 4 auth
  ↓
Phase 5 admin foundation
  ↓
Phase 6 admin create product
  ↓
Phase 7 admin product management
  ↓
Phase 8 favorites/reviews
  ↓
Phase 9 cart/orders
  ↓
Phase 10 Stripe checkout
  ↓
Phase 11 deployment
```

Parallel-safe areas after Phase 4:

```text
Favorites/reviews can run partly in parallel with admin product management.
Cart/orders should wait until products + auth are stable.
Stripe should wait until cart/orders are stable.
Deployment should wait until core flows are stable.
```

---

# Global Acceptance Gates

Every implementation bead should run:

```bash
npx tsc --noEmit
```

When tests exist:

```bash
npm test
```

Before closing UI beads:

```bash
npm run dev
```

Manual browser checks are required for:

- Navbar/theme
- Product browsing
- Search
- Auth
- Admin access
- Product CRUD
- Cart
- Checkout
- Orders

---

# Agent Execution Prompt Template

Use this when handing a bead to Claude Code or Codex:

```text
Work on bead $BEAD_ID only.

Read:
- PLAN.md
- CLAUDE.md or AGENTS.md
- The bead description and acceptance criteria

Rules:
- Stay inside this bead's scope.
- Do not implement future phases.
- Do not rewrite unrelated code.
- Preserve existing working behavior.
- Run the required verification commands.
- Report changed files, verification results, and any remaining risks.
```

---

# Closing Rule

Do not close a bead because the code was written.

Close only when:

```text
Acceptance criteria passed + verification completed + manual check completed when UI is involved.
```

---

# Practical First Milestone Recommendation

For your first agentic run, do not attempt the whole ecommerce app.

Start with this milestone:

```text
Milestone 1 — Public Store Foundation
- Phase 0
- Phase 1
- Phase 2
- Phase 3
```

This gives you:

- Working Next app
- Public layout
- Database product model
- Seeded product data
- Product browsing
- Search
- Single product pages

Then move to:

```text
Milestone 2 — Auth + Admin Product CRUD
- Phase 4
- Phase 5
- Phase 6
- Phase 7
```

Then:

```text
Milestone 3 — User Commerce Features
- Phase 8
- Phase 9
- Phase 10
```

Finally:

```text
Milestone 4 — Deployment
- Phase 11
```

---

# End State

At the end, the project should be a complete ecommerce store with:

- Public storefront
- Product search and detail pages
- Clerk authentication
- Admin product management
- Supabase image upload
- Favorites
- Reviews
- Cart
- Orders
- Stripe checkout
- Vercel deployment

This plan is suitable to become the project `PLAN.md` and to generate Beads epics/tasks from it.


