"use client";

import { useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";

// loadStripe must run once per page load — pull it to module scope so a
// rerender doesn't tear down and rebuild the Stripe.js script tag.
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

type CheckoutFormProps = {
  orderId: string;
  cartId: string;
};

export default function CheckoutForm({ orderId, cartId }: CheckoutFormProps) {
  // /api/payment is wired in 10.2. Until then this fetch returns 404 and
  // EmbeddedCheckout renders an error state — by design for 10.1.
  const fetchClientSecret = useCallback(async () => {
    const res = await fetch("/api/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, cartId }),
    });
    if (!res.ok) {
      throw new Error("could not start checkout session");
    }
    const data = (await res.json()) as { clientSecret: string };
    return data.clientSecret;
  }, [orderId, cartId]);

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
