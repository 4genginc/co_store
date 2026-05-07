import Stripe from "stripe";

// Lazy-constructed Stripe server client. Stripe v22's constructor
// throws immediately when given an empty/missing secret key ("Neither
// apiKey nor config.authenticator provided"), which crashes the
// build's "Collecting page data" pass on any platform that doesn't
// surface STRIPE_SECRET_KEY at build time. Deferring construction to
// first call keeps the build green and scopes the failure to the
// actual /api/payment + /api/confirm requests if the var is missing
// at runtime.
let cached: Stripe | null = null;

export function stripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  cached = new Stripe(key);
  return cached;
}
