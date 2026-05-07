import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/utils/db";
import { getAdminUser, getAuthUser } from "@/utils/admin";

export async function fetchFeaturedProducts() {
  return db.product.findMany({
    where: { featured: true },
    orderBy: { createdAt: "desc" },
  });
}

type FetchAllProductsArgs = {
  search?: string;
};

export async function fetchAllProducts({ search = "" }: FetchAllProductsArgs = {}) {
  return db.product.findMany({
    where: {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function fetchSingleProduct(productId: string) {
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) redirect("/products");
  return product;
}

export async function fetchAdminProducts() {
  await getAdminUser();
  return db.product.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function fetchAdminProductDetails(productId: string) {
  await getAdminUser();
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) notFound();
  return product;
}

// Returns the favorite row id for the current signed-in user + product, or
// null if the user is signed out or hasn't favorited this product. Used by
// FavoriteToggleButton to render filled vs empty state and pass the id back
// to toggleFavoriteAction so the action knows whether to create or delete.
export async function fetchFavoriteId(productId: string): Promise<string | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const favorite = await db.favorite.findUnique({
    where: { clerkId_productId: { clerkId: userId, productId } },
    select: { id: true },
  });
  return favorite?.id ?? null;
}

export async function fetchUserFavorites() {
  const userId = await getAuthUser();
  return db.favorite.findMany({
    where: { clerkId: userId },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function fetchProductReviews(productId: string) {
  return db.review.findMany({
    where: { productId },
    orderBy: { createdAt: "desc" },
  });
}

// Aggregate average rating + total review count for a product. Returns
// `{ rating: 0, count: 0 }` when there are no reviews so callers can
// render placeholders without a null check.
export async function fetchProductRating(productId: string) {
  const result = await db.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });
  return {
    rating: result._avg.rating ?? 0,
    count: result._count.rating,
  };
}

export async function fetchUserReviews() {
  const userId = await getAuthUser();
  return db.review.findMany({
    where: { clerkId: userId },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });
}

// Returns the current user's review for `productId` (or null if signed out
// or hasn't reviewed). Used by the single-product page to hide the review
// form once a user has already submitted one.
export async function fetchUserProductReview(productId: string) {
  const { userId } = await auth();
  if (!userId) return null;
  return db.review.findUnique({
    where: { clerkId_productId: { clerkId: userId, productId } },
  });
}

// Number of items in the signed-in user's cart, or 0 for signed-out
// users / users who haven't started a cart yet. Used by the navbar
// CartButton on every page render. Deliberately *not* using
// fetchOrCreateCart — we don't want to materialize an empty Cart row
// for every visitor who hasn't opened /cart.
export async function fetchCartItemCount(): Promise<number> {
  const { userId } = await auth();
  if (!userId) return 0;
  const cart = await db.cart.findFirst({
    where: { clerkId: userId },
    select: { numItemsInCart: true },
  });
  return cart?.numItemsInCart ?? 0;
}

// Cart helpers — used by cart server actions and cart page.
// Kept here (not actions.ts) because they're not invoked from client
// components directly; the server actions in utils/actions.ts compose them.

// Throws if the product is missing, so callers running inside an action
// try/catch can surface a clean error message to the user.
export async function fetchProduct(productId: string) {
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("product not found");
  return product;
}

// Returns the user's cart, creating an empty one on first call. Pass
// `errorOnFailure: true` from contexts where missing cart should be a
// hard error (e.g. /cart route when we expect one to exist).
export async function fetchOrCreateCart({
  userId,
  errorOnFailure = false,
}: {
  userId: string;
  errorOnFailure?: boolean;
}) {
  const existing = await db.cart.findFirst({
    where: { clerkId: userId },
    include: { cartItems: { include: { product: true } } },
  });
  if (existing) return existing;
  if (errorOnFailure) throw new Error("cart not found");
  return db.cart.create({
    data: { clerkId: userId },
    include: { cartItems: { include: { product: true } } },
  });
}

// Add `amount` of a product to the cart. If the line item exists,
// increment; otherwise create a new line. Quantity totals are *not*
// recomputed here — call updateCart(cartId) after to refresh denormalized
// totals on the Cart row.
export async function updateOrCreateCartItem({
  productId,
  cartId,
  amount,
}: {
  productId: string;
  cartId: string;
  amount: number;
}) {
  const existing = await db.cartItem.findUnique({
    where: { cartId_productId: { cartId, productId } },
  });
  if (existing) {
    return db.cartItem.update({
      where: { id: existing.id },
      data: { amount: existing.amount + amount },
    });
  }
  return db.cartItem.create({
    data: { cartId, productId, amount },
  });
}

// Paid orders for the signed-in user, newest first. Used by /orders.
// Filters on isPaid=true so unpaid orders (created at place-order
// time, before Stripe confirmation) don't surface as a phantom order
// in the list — see /api/confirm for where they get flipped.
export async function fetchUserOrders() {
  const userId = await getAuthUser();
  return db.order.findMany({
    where: { clerkId: userId, isPaid: true },
    orderBy: { createdAt: "desc" },
  });
}

// Paid orders across all users, newest first. Used by /admin/sales.
// Filters to isPaid=true so the admin "sales" view isn't polluted by
// abandoned non-Stripe orders once a real payment flow lands.
export async function fetchAdminOrders() {
  await getAdminUser();
  return db.order.findMany({
    where: { isPaid: true },
    orderBy: { createdAt: "desc" },
  });
}

// Recompute denormalized totals on the Cart row from current line items
// and product prices. Returns the refreshed cart with items + products
// included so callers don't need a follow-up read. Money values are
// stored as integer cents to match Product.price.
export async function updateCart(cartId: string) {
  const cart = await db.cart.findUnique({
    where: { id: cartId },
    include: { cartItems: { include: { product: true } } },
  });
  if (!cart) throw new Error("cart not found");

  let numItemsInCart = 0;
  let cartTotal = 0;
  for (const item of cart.cartItems) {
    numItemsInCart += item.amount;
    cartTotal += item.product.price * item.amount;
  }
  const tax = Math.round(cartTotal * cart.taxRate);
  const orderTotal = cartTotal + tax + cart.shipping;

  return db.cart.update({
    where: { id: cart.id },
    data: { numItemsInCart, cartTotal, tax, orderTotal },
    include: { cartItems: { include: { product: true } } },
  });
}
