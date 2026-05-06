import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/utils/db";
import { getAdminUser } from "@/utils/admin";
import {
  productSchema,
  validateWithZodSchema,
  validateImageFile,
} from "@/utils/schemas";
import { uploadImage } from "@/utils/supabase";
import type { ActionState } from "@/components/form/FormContainer";

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

export async function createProductAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  "use server";
  try {
    const userId = await getAdminUser();

    const imageResult = validateImageFile(formData.get("image"));
    if (!imageResult.ok) {
      return { message: imageResult.message, success: false };
    }

    const productResult = validateWithZodSchema(
      productSchema,
      Object.fromEntries(formData)
    );
    if (!productResult.ok) {
      return { message: productResult.message, success: false };
    }

    const imageUrl = await uploadImage(imageResult.data);

    await db.product.create({
      data: {
        ...productResult.data,
        image: imageUrl,
        clerkId: userId,
      },
    });
  } catch (e) {
    return {
      message: e instanceof Error ? e.message : "could not create product",
      success: false,
    };
  }
  revalidatePath("/products");
  revalidatePath("/admin/products");
  redirect("/admin/products");
}
