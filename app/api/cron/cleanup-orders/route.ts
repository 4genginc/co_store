import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/utils/db";

// GET /api/cron/cleanup-orders
//
// Deletes Order rows with isPaid=false older than UNPAID_ORDER_TTL_HOURS.
// Abandoned-checkout cleanup — createOrderAction inserts an unpaid Order
// before redirecting to Stripe; if the user never completes payment, the
// row sits in the table forever (invisible because fetchUserOrders +
// fetchAdminOrders both filter on isPaid=true). This route GCs them.
//
// Auth: requires `Authorization: Bearer ${CRON_SECRET}`. Vercel Cron
// supplies that header automatically when CRON_SECRET is set in env.
// Fails closed: if CRON_SECRET is unset, every request is rejected so
// the route can't accidentally be triggered open.
//
// Schedule: see vercel.json (`crons` array). Default in this repo is
// daily at 03:00 UTC. Pick a TTL ≥ 24h to comfortably outlive Stripe
// Checkout Session lifetimes (24h default) so the GC never deletes an
// order while the user is mid-payment.
//
// Manual run (debugging or one-off):
//   curl -H "Authorization: Bearer $CRON_SECRET" \
//        https://my-store-fedp.vercel.app/api/cron/cleanup-orders
//
// Returns: { deleted: number, cutoff: ISO8601, ttlHours: number }
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[/api/cron/cleanup-orders] CRON_SECRET not set — refusing");
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const ttlHoursRaw = process.env.UNPAID_ORDER_TTL_HOURS ?? "24";
  const ttlHours = Number(ttlHoursRaw);
  if (!Number.isFinite(ttlHours) || ttlHours <= 0) {
    console.error(
      "[/api/cron/cleanup-orders] invalid UNPAID_ORDER_TTL_HOURS:",
      ttlHoursRaw
    );
    return NextResponse.json(
      { error: "invalid UNPAID_ORDER_TTL_HOURS" },
      { status: 500 }
    );
  }

  const cutoff = new Date(Date.now() - ttlHours * 60 * 60 * 1000);
  try {
    const result = await db.order.deleteMany({
      where: {
        isPaid: false,
        createdAt: { lt: cutoff },
      },
    });
    console.log(
      `[/api/cron/cleanup-orders] deleted=${result.count} ttlHours=${ttlHours} cutoff=${cutoff.toISOString()}`
    );
    return NextResponse.json({
      deleted: result.count,
      cutoff: cutoff.toISOString(),
      ttlHours,
    });
  } catch (error) {
    console.error("[/api/cron/cleanup-orders]", error);
    return NextResponse.json({ error: "cleanup failed" }, { status: 500 });
  }
}
