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
