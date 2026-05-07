import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/utils/db";
import { stripe } from "@/utils/stripe";

// GET /api/confirm?session_id=cs_...
//
// Stripe redirects the customer's browser here after embedded checkout
// resolves (return_url set in /api/payment). We retrieve the session,
// check it actually completed, and — if so — flip the Order to
// isPaid=true and delete the Cart (CartItem rows cascade-delete via
// the schema).
//
// Failure modes:
// - Expected (abandoned / expired session, missing session_id) →
//   redirect the user to /cart so they can retry. Log a warning.
// - Unexpected (Stripe API error, DB error, mismatched ownership) →
//   opaque 500 JSON to the browser. The internal `stage` and full
//   error are written to console.error for server-side diagnosis;
//   nothing useful to an attacker is in the response body.
//
// The handler is idempotent: hitting it twice for the same session
// won't double-mark or error on the cart delete (deleteMany no-ops on
// zero matches).
export async function GET(req: NextRequest) {
  let stage: string = "init";
  try {
    stage = "auth";
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    stage = "parse-query";
    const sessionId = new URL(req.url).searchParams.get("session_id");
    if (!sessionId) {
      console.warn("[/api/confirm] missing session_id");
      return NextResponse.redirect(new URL("/cart", req.url));
    }

    stage = "stripe-retrieve";
    const session = await stripe().checkout.sessions.retrieve(sessionId);
    if (session.status !== "complete") {
      console.warn(
        "[/api/confirm] session",
        sessionId,
        "status:",
        session.status
      );
      return NextResponse.redirect(new URL("/cart", req.url));
    }

    stage = "metadata-extract";
    const orderId = session.metadata?.orderId;
    const cartId = session.metadata?.cartId;
    if (!orderId || !cartId) {
      console.error(
        "[/api/confirm] session",
        sessionId,
        "missing metadata orderId/cartId"
      );
      return NextResponse.json(
        { error: "session metadata missing" },
        { status: 500 }
      );
    }

    stage = "order-fetch";
    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) {
      console.error("[/api/confirm] order", orderId, "not found");
      return NextResponse.json({ error: "order not found" }, { status: 404 });
    }
    if (order.clerkId !== userId) {
      console.error(
        "[/api/confirm] order",
        orderId,
        "owned by",
        order.clerkId,
        "but request from",
        userId
      );
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    if (!order.isPaid) {
      stage = "order-update";
      await db.order.update({
        where: { id: orderId },
        data: { isPaid: true },
      });
    }
    // deleteMany is idempotent — zero matches is fine on a retry where
    // the cart was already cleared.
    stage = "cart-delete";
    await db.cart.deleteMany({ where: { id: cartId } });

    stage = "redirect";
    return NextResponse.redirect(new URL("/orders", req.url));
  } catch (error) {
    console.error(`[/api/confirm] stage=${stage}`, error);
    return NextResponse.json(
      { error: "could not confirm payment" },
      { status: 500 }
    );
  }
}
