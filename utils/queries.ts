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
