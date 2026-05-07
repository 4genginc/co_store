import Stripe from "stripe";

// Singleton Stripe client for server-side use only. The default API
// version is the one bundled with the SDK; pinning is unnecessary while
// we're on a single SDK major. STRIPE_SECRET_KEY must be set — we let
// the SDK throw at call time rather than at module load so a missing
// var only kills payment routes, not the whole app.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
