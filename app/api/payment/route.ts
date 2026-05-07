import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/utils/db";
import { stripe } from "@/utils/stripe";

// POST /api/payment
// Body: { orderId: string, cartId: string }
// Returns: { clientSecret } for a Stripe embedded-mode Checkout Session.
//
// Ownership: the signed-in user must own the order, and the cart must
// belong to the same user. Mismatches surface as 403 rather than 404 so
// a probing client can't enumerate other users' order ids.
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => null)) as
      | { orderId?: unknown; cartId?: unknown }
      | null;
    const orderId = typeof body?.orderId === "string" ? body.orderId : null;
    const cartId = typeof body?.cartId === "string" ? body.cartId : null;
    if (!orderId || !cartId) {
      return NextResponse.json(
        { error: "missing orderId or cartId" },
        { status: 400 }
      );
    }

    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "order not found" }, { status: 404 });
    }
    if (order.clerkId !== userId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const cart = await db.cart.findUnique({
      where: { id: cartId },
      include: { cartItems: { include: { product: true } } },
    });
    if (!cart) {
      return NextResponse.json({ error: "cart not found" }, { status: 404 });
    }
    if (cart.clerkId !== userId) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    if (cart.cartItems.length === 0) {
      return NextResponse.json({ error: "cart is empty" }, { status: 400 });
    }

    // Build Stripe line items from cart products, then append tax +
    // shipping as separate line items so the Stripe-rendered breakdown
    // matches the cart-page totals. Source tax/shipping from the Order
    // (snapshot) rather than the live Cart so a totals drift between
    // place-order and pay won't change what's charged.
    const productLines = cart.cartItems.map((item) => ({
      quantity: item.amount,
      price_data: {
        currency: "usd",
        unit_amount: item.product.price,
        product_data: {
          name: item.product.name,
          images: [item.product.image],
        },
      },
    }));
    const taxLine =
      order.tax > 0
        ? [
            {
              quantity: 1,
              price_data: {
                currency: "usd",
                unit_amount: order.tax,
                product_data: { name: "Tax" },
              },
            },
          ]
        : [];
    const shippingLine =
      order.shipping > 0
        ? [
            {
              quantity: 1,
              price_data: {
                currency: "usd",
                unit_amount: order.shipping,
                product_data: { name: "Shipping" },
              },
            },
          ]
        : [];

    const websiteUrl =
      process.env.NEXT_PUBLIC_WEBSITE_URL ?? "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      // Stripe v21+ renamed ui_mode "embedded" → "embedded_page"
      // (and "hosted" → "hosted_page") under API version
      // 2026-03-25.dahlia. The React SDK still drives this via
      // client_secret, so the rename is purely a server-side enum.
      ui_mode: "embedded_page",
      mode: "payment",
      line_items: [...productLines, ...taxLine, ...shippingLine],
      metadata: { orderId, cartId },
      return_url: `${websiteUrl}/api/confirm?session_id={CHECKOUT_SESSION_ID}`,
    });

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error("[/api/payment]", error);
    return NextResponse.json(
      { error: "could not create checkout session" },
      { status: 500 }
    );
  }
}
