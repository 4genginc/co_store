import { redirect, notFound } from "next/navigation";
import { db } from "@/utils/db";
import { getAdminUser } from "@/utils/admin";

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
